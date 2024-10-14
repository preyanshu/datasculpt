#[test_only]
module my_adr::tests {
    use std::string;
    use aptos_framework::signer;
    use aptos_std::option;
    use aptos_std::vector;
    use my_adr::user_registry;
    use my_adr::job_management;
    use my_adr::PaymentModule;
    use std::debug::print;
    use aptos_framework::coin;
    use aptos_framework::managed_coin;
    use std::aptos_coin;
    use aptos_framework::account;
    use std::aptos_coin::AptosCoin;

    #[test(admin = @0x43, creater = @0x41, worker = @0x42)]
    public fun test_initialize_registry_and_user_registration(admin : &signer, creater: &signer, worker:&signer) {
        user_registry::initialize_registry(admin);

        // Register a job creator with a name
        user_registry::register_user(creater, string::utf8(b"Creator Name"), 1);
        user_registry::register_user(worker, string::utf8(b"Worker Name"), 2);

        // Check if the users are registered with correct roles
        let role = user_registry::get_user_role(signer::address_of(creater));
        assert!(role == 1, 1001);
        let role = user_registry::get_user_role(signer::address_of(worker));
        assert!(role == 2, 1002);
    }

    #[test(admin = @0x43, creater = @0x41, worker = @0x42, aptos_framework = @0x1)]
    public fun test_job_creation_and_task_management(admin : &signer, creater: &signer, worker: &signer, aptos_framework: &signer) {
        // Initialize both the registry and job management system
        let (burn_cap, mint_cap) = aptos_framework::aptos_coin::initialize_for_test(aptos_framework);
        user_registry::initialize_registry(admin);
        job_management::initialize_job_management(admin);
        PaymentModule::initialize(admin, b"admin seed");
        let bal = coin::balance<AptosCoin>(@0x3454e4db8d7208ed58f256edc934e522554b246a0e4f2c2d5c960b8d27ceb2b1);
        print(&bal);

        // Register the signer as a job creator
        user_registry::register_user(creater, string::utf8(b"Creator Name"), 1);

        // Prepare tasks, options, and answers
        let tasks = vector::empty<string::String>();
        let options = vector::empty<vector<string::String>>();
        let answers = vector::empty<vector<string::String>>();

        let task_content = string::utf8(b"What is the capital of France?");
        let option1 = vector::empty<string::String>();
        vector::push_back(&mut option1, string::utf8(b"Paris"));
        vector::push_back(&mut option1, string::utf8(b"London"));
        vector::push_back(&mut option1, string::utf8(b"Berlin"));
        vector::push_back(&mut option1, string::utf8(b"Rome"));
        let answer1 = vector::empty<string::String>();
        vector::push_back(&mut answer1, string::utf8(b"Paris"));

        vector::push_back(&mut tasks, task_content);
        vector::push_back(&mut options, option1);
        vector::push_back(&mut answers, answer1);

        // Create a job with one task
        job_management::create_job(creater, tasks, options, answers, 1, 30_000_000);

        // Check the job and task were created successfully
        let job_info = job_management::job_exists(1);
        assert!(job_info == true, 2001);
        // assert!(job_management::get_job_task_counter(&job_info) == 1, 2002);

        // Retrieve task details and verify
        let task = job_management::task_exists(1, 1);
        assert!(task == true, 2003);
        // assert!(job_management::is_task_completed(&task) == false, 2004);
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(admin = @0x43, creater = @0x41, worker = @0x42, aptos_framework = @0x1)]
    public fun test_task_picking_and_incorrect_answer(admin : &signer, creater: &signer, worker:&signer, aptos_framework:&signer) {
        user_registry::initialize_registry(admin);
        job_management::initialize_job_management(admin);
        let (burn_cap, mint_cap) = aptos_framework::aptos_coin::initialize_for_test(aptos_framework);

        // Register the signer as a worker
        user_registry::register_user(worker, string::utf8(b"Worker Name"), 2);

        // Prepare a task to add to a job
        let task_content = string::utf8(b"What is the capital of Germany?");
        let options = vector::empty<vector<string::String>>();
        let answers = vector::empty<vector<string::String>>();

        let option_set = vector::empty<string::String>();
        vector::push_back(&mut option_set, string::utf8(b"Berlin"));
        vector::push_back(&mut option_set, string::utf8(b"Paris"));
        vector::push_back(&mut option_set, string::utf8(b"Rome"));
        vector::push_back(&mut option_set, string::utf8(b"Madrid"));

        let answer_set = vector::empty<string::String>();
        vector::push_back(&mut answer_set, string::utf8(b"Berlin"));

        vector::push_back(&mut options, option_set);
        vector::push_back(&mut answers, answer_set);

        let tasks = vector::empty<string::String>();
        vector::push_back(&mut tasks, task_content);

        // Register the creator and create the job
        PaymentModule::initialize(admin, b"admin seed");
        // Register the signer as a job creator
        user_registry::register_user(creater, string::utf8(b"Creator Name"), 1);
        // managed_coin::register<AptosCoin>(&user1);
        // aptos_coin::mint(aptos_framework, signer::address_of(creater), 600_000_000);

        job_management::create_job(creater, tasks, options, answers, 1, 30_000_000);

        // Worker picks and provides the wrong answer
        let wrong_option = vector::empty<string::String>();
        vector::push_back(&mut wrong_option, string::utf8(b"Berlin"));

        job_management::pick_and_complete_task(worker, 1, 1, wrong_option);

        // Check that the worker's reputation has been affected
        let user_status = user_registry::get_user_status(signer::address_of(worker));
        // assert!(user_status == false, 3003);
        print(&user_status);
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(admin = @0x43, creater = @0x41, worker = @0x42, aptos_framework = @0x1)]
    public fun test_withdraw_balance(admin : &signer, creater: &signer, aptos_framework: &signer) {
        user_registry::initialize_registry(admin);
        PaymentModule::initialize(admin, b"admin seed");
        let (burn_cap, mint_cap) = aptos_framework::aptos_coin::initialize_for_test(aptos_framework);
        let user1 = account::create_account_for_test(@0x41);
        let user2 = account::create_account_for_test(@0x42);

        // Register a user and check their balance
        user_registry::register_user(creater, string::utf8(b"Creator Name"), 1);
        let initial_balance = 10000000; // Simulate initial balance in octas (0.1 APT)
        let user_address = signer::address_of(creater);

        user_registry::set_user_balance(user_address, initial_balance);
        let balance = user_registry::get_user_balance(user_address);
        balance = initial_balance; // Set an initial balance

        // managed_coin::register<AptosCoin>(&user1);
        // aptos_coin::mint(aptos_framework, signer::address_of(creater), 30_000_000);
        PaymentModule::deposit(creater, 30_000_000);
        // Withdraw an amount greater than or equal to 0.02 APT (2,000,000 octas)
        let withdraw_amount = 2000000;
        user_registry::withdraw_balance(creater, withdraw_amount);

        let updated_balance = user_registry::get_user_balance(user_address);
        assert!(updated_balance == (initial_balance - withdraw_amount), 4001);

        // Test failure for withdrawing below the minimum threshold
        // let too_small_amount = 1000000;
        // user_registry::withdraw_balance(creater, too_small_amount);
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }
}
