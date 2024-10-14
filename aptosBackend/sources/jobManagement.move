module my_adr::job_management {
    use aptos_std::table;
    use aptos_framework::signer;
    use aptos_std::string;
    use my_adr::user_registry;
    use std::vector;
    use std::debug::print;

    // Errors
    const E_NOT_JOB_CREATOR: u64 = 1;
    const E_JOB_DOESNT_EXIST: u64 = 2;
    const E_NOT_REGISTERED: u64 = 3;
    const E_TASK_ALREADY_PICKED: u64 = 4;
    const E_TASK_NOT_PICKED_BY_WORKER: u64 = 5;
    const E_MAX_WORKERS_REACHED: u64 = 6;
    const ROLE_JOB_CREATOR: u64 = 1;
    const ROLE_WORKER: u64 = 2;
    const E_ALREADY_INITIALIZED: u64 = 0;
    const E_YOU_ARE_BANNED: u64 = 7;
    const E_WRONG_ANSWER: u64 = 8;
    const E_NOT_WORKER:u64 = 9;
    const E_TASK_ALREADY_COMPLETED : u64 = 3;
    const E_INVALID_TASK_ID:u64 = 9;


    // Task struct now includes a question, four options, and picked_by as a vector of addresses
    struct Task has copy, store {
        question: string::String,   // Question to be answered
        options: vector<string::String>, // 4 options for the task
        picked_by: vector<address>, // Workers who picked the task
        max_workers: u64,           // Max workers allowed to pick the task
        completed: bool,
        task_id: u64,
        task_answers: vector<vector<string::String>>,          // Whether the task is completed
    }

    // Job struct now includes tasks as a mapping from task_id to Task
    struct Job has store {
        job_name: string::String,
        job_type: string::String,
        job_id: u64,
        amount: u64,
        max_workers: u64,
        creator: address,
        tasks: table::Table<u64, Task>, // Table of task_id to Task
        task_counter: u64,          // Counter for tasks
        predeterminedans: vector<TaskAnswer>, // Predetermined answers
        is_completed: bool,
        completed_tasks: u64,
        task_pick_count: vector<u64>,
    }

    struct TaskAnswer has copy, store {
        task_id: u64,
        ans: vector<string::String>, // Correct answer for the task (assumed to be one of the options)
    }

    struct JobManagement has key {
        jobs: table::Table<u64, Job>,
        job_counter: u64,
        job_ids: vector<u64>,
    }

    const GLOBAL_JOB_MANAGEMENT_ADDRESS: address = @0x1dc03758f2c3a17cec451cfef4b7f50fd530c10400731aa2c22abcde7b678bd6;

    // Initialize job management
    public entry fun initialize_job_management(admin: &signer) {
        assert!(!exists<JobManagement>(GLOBAL_JOB_MANAGEMENT_ADDRESS), E_ALREADY_INITIALIZED);
            let job_management = JobManagement {
            jobs: table::new(),
            job_counter: 0,
            job_ids: vector::empty(),  
        };
        move_to(admin, job_management);
    }

    // Create a job with tasks that include a question, options, and worker limits
    public entry fun create_job(
        account: &signer,
        tasks: vector<string::String>,  
        options: vector<vector<string::String>>, 
        answers: vector<vector<string::String>>,  
        max_workers: u64 ,
        deposit_amount:u64,
        job_name: string::String,
        job_type: string::String,
    ) acquires JobManagement {
        //deduct payment from the users also add the amount parameter in the function use the ppayment smartcontract
        let signer_address = signer::address_of(account);

        
        let role = user_registry::get_user_role(signer_address);
        assert!(role == ROLE_JOB_CREATOR, E_NOT_JOB_CREATOR);

        my_adr::PaymentModule::deposit(account, deposit_amount);

        let job_management = borrow_global_mut<JobManagement>(GLOBAL_JOB_MANAGEMENT_ADDRESS);
        let job_counter = job_management.job_counter + 1;

        // Create a new job and populate the task table
        let task_table = table::new<u64, Task>();
        let num_tasks = vector::length(&tasks);
        let predeterminedans = vector::empty<TaskAnswer>();
        let task_answers = vector::empty<vector<string::String>>();
        let i = 0;
        let task_pick_count = vector::empty<u64>();
        
        while (i < num_tasks) {
            let task_id = i + 1;
            let task = Task {
                question: *vector::borrow(&tasks, i),
                options: *vector::borrow(&options, i),
                picked_by: vector::empty<address>(), 
                max_workers: max_workers,
                completed: false,
                task_id: task_id,
                task_answers: task_answers,
            };
            table::add(&mut task_table, task_id, task);

            let answer = TaskAnswer {
                task_id: task_id,
                ans: *vector::borrow(&answers, i),
            };
            vector::push_back(&mut predeterminedans, answer);
            vector::push_back(&mut task_pick_count, 0);
            i = i + 1;
        };

        // Add the job to global storage
        let job = Job {
            job_name: job_name,
            job_type: job_type,
            job_id: job_counter,
            max_workers: max_workers,
            amount: deposit_amount,
            creator: signer_address,
            tasks: task_table,
            task_counter: num_tasks,
            predeterminedans: predeterminedans,
            is_completed: false,
            completed_tasks: 0,
            task_pick_count: task_pick_count,
        };
        // print(&job);
        table::add(&mut job_management.jobs, job_counter, job);
        vector::push_back(&mut job_management.job_ids, job_counter);
        job_management.job_counter = job_counter;
        user_registry::created_job(signer_address);
    }

    // Function to pick and complete a task
    public entry fun pick_and_complete_task(  
        account: &signer, 
        job_id: u64, 
        task_id: u64, 
        chosen_option: vector<string::String>  // Option chosen by the worker
    ) acquires JobManagement {
        let signer_address = signer::address_of(account);
        let user_status = user_registry::get_user_status(signer_address);
        assert!(user_status == false, E_YOU_ARE_BANNED);
        // Ensure the user is a worker
        let role = user_registry::get_user_role(signer_address);
        assert!(role == ROLE_WORKER, E_NOT_WORKER);

        // Get the job and task details
        let job_management = borrow_global_mut<JobManagement>(GLOBAL_JOB_MANAGEMENT_ADDRESS);
        assert!(table::contains(&job_management.jobs, job_id), E_JOB_DOESNT_EXIST);

        print(&string::utf8(b"printing jobs"));
        let p_job = table::borrow(&job_management.jobs, job_id);
        print(p_job);

        let job = table::borrow_mut(&mut job_management.jobs, job_id);
        assert!(table::contains(&job.tasks, task_id), E_JOB_DOESNT_EXIST);

        print(&string::utf8(b"printing picked task"));
        let p_task = table::borrow(&job.tasks, task_id);
        print(p_task);
        let correct_answer = get_task_answer(job, task_id);
        let task = table::borrow_mut(&mut job.tasks, task_id);
        
        // Check if the worker can pick the task (based on max_workers)
        let num_picked = vector::length(&task.picked_by);
        assert!(num_picked < task.max_workers, E_MAX_WORKERS_REACHED);
        assert!(task.completed == false, E_MAX_WORKERS_REACHED);

        // Check if the worker has already picked the task
        let already_picked = vector::contains(&task.picked_by, &signer_address);
        assert!(!already_picked, E_TASK_ALREADY_PICKED);

        // Complete the task by verifying the chosen option matches the predetermined answer
        let correct_answer_length = vector::length(&correct_answer);

        let ban = false;

        if (correct_answer_length > 0) {
            if (correct_answer_length < vector::length(&chosen_option)) {
                ban = true;  // If chosen_option has more elements than correct_answer, ban.
            } else {
                let i = 0;

                // Iterate through all elements of chosen_option
                while (!ban && i < vector::length(&chosen_option)) {
                    let chosen_element = vector::borrow(&chosen_option, i);

                    // Check if the element exists in correct_answer
                    if (!vector::contains(&correct_answer, chosen_element)) {
                        ban = true;  // If an element is not found, set ban to true.
                        break
                    };
                    i = i + 1;
                };
            }
        };

        if(ban == true){
            user_registry::update_reputation(signer_address);
        }
        else{
            // Update the task pick count
            let task_pick_count_ref = &mut job.task_pick_count;
            assert!(task_id > 0, E_INVALID_TASK_ID); // Prevent out-of-bounds issue
            let task_picks = vector::borrow_mut(task_pick_count_ref, task_id - 1);  // Zero-index correction for task_id
            *task_picks = *task_picks + 1;

            // Add worker to task's picked_by and store chosen answer
            user_registry::job_completed_worker(signer_address);
            vector::push_back(&mut task.picked_by, signer_address);
            vector::push_back(&mut task.task_answers, chosen_option);
            print(&string::utf8(b"printing picked by"));
            print(&task.picked_by);
            if(num_picked + 1 == task.max_workers){
                print(&string::utf8(b"task completed"));
                task.completed = true;
                job.completed_tasks = job.completed_tasks + 1;
                print(task);
            };
            if(job.completed_tasks == job.task_counter){
                job.is_completed = true;
                user_registry::job_completed_creator(job.creator);
            };          
            let user_balance = user_registry::get_user_balance(signer_address);

            // Add 0.05 APT to the user balance. 
            let additional_balance: u64 = 5000000; 
            user_balance = user_balance + additional_balance;

            // Update the user's balance in the registry
            user_registry::set_user_balance(signer_address, user_balance);

            // Retrieve the new balance and print it
            let new_balance = user_registry::get_user_balance(signer_address);
            print(&string::utf8(b"printing new balance"));
            print(&new_balance);
        };
    }
    // Helper function to get the predetermined answer for a task
    fun get_task_answer(job: &Job, task_id: u64): vector<string::String> {
        let task_answers = &job.predeterminedans;
        let num_answers = vector::length(task_answers);
        let i = 0;
        while (i < num_answers) {
            let answer = vector::borrow(task_answers, i);
            if (answer.task_id == task_id) {
                return answer.ans
                // break
            };
            i = i + 1;
        };
        return vector::empty<string::String>()
    }

    public fun job_exists(job_id: u64): bool acquires JobManagement {
        let job_management = borrow_global<JobManagement>(GLOBAL_JOB_MANAGEMENT_ADDRESS);
        table::contains<u64, Job>(&job_management.jobs, job_id)
    }

    public fun task_exists(job_id: u64, task_id: u64): bool acquires JobManagement {
        let job_management = borrow_global<JobManagement>(GLOBAL_JOB_MANAGEMENT_ADDRESS);

        // Check if the job exists first
        if (!table::contains<u64, Job>(&job_management.jobs, job_id)) {
            return false
        };

        // Borrow the job and check if the task exists in the job
        let job = table::borrow<u64, Job>(&job_management.jobs, job_id);
        table::contains<u64, Task>(&job.tasks, task_id)
    }

}
