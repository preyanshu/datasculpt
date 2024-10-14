module my_adr::user_registry {
    use aptos_framework::signer;
    use aptos_std::table;
    use aptos_std::string;

    friend my_adr::job_management;

    // Errors
    const E_ALREADY_INITIALIZED:u64 = 0;
    const E_ALREADY_REGISTERED: u64 = 1;
    const E_NOT_REGISTERED: u64 = 2;
    const E_INSUFFICIENT_BALANCE: u64 = 3;
    const E_INVALID_WITHDRAW_AMOUNT: u64 = 4;

    // Role types
    const ROLE_JOB_CREATOR: u64 = 1;
    const ROLE_WORKER: u64 = 2;

    // Minimum withdrawal amount (0.02 APT in Octas, 1 APT = 10^8 Octas)
    const MINIMUM_WITHDRAWAL_AMOUNT: u64 = 20000000; // 0.02 APT


    // Struct to store individual user data
    struct User has key, store, drop, copy {
        name: string::String,     // User's name
        wallet_address: address,  // User's wallet address
        role: u64,                // Role (job creator or worker)
        reputation_points: u64,
        isBanned: bool,
        balance: u64, 
        worker_completed_jobs: u64,
        jobs_created: u64,
        creator_completed_jobs: u64,
    }

    // Struct to store the registry of users
    struct UserRegistry has key {
        users: table::Table<address, User>, // Store all users by wallet address
    }

    // Global address for the registry
    const GLOBAL_REGISTRY_ADDRESS: address = @0x1dc03758f2c3a17cec451cfef4b7f50fd530c10400731aa2c22abcde7b678bd6;

    // Initialize the registry if it doesn't exist
    public entry fun initialize_registry(admin: &signer) {
        assert!(!exists<UserRegistry>(signer::address_of(admin)), E_ALREADY_INITIALIZED);
        let registry = UserRegistry {
            users: table::new(),
        };
        move_to(admin, registry);
    }

    // Register a user with a name and role, default reputation points are 200
    public entry fun register_user(account: &signer, name: string::String, role: u64) acquires UserRegistry {
        let signer_address = signer::address_of(account);
        let registry = borrow_global_mut<UserRegistry>(GLOBAL_REGISTRY_ADDRESS);

        assert!(!table::contains(&registry.users, signer_address), E_ALREADY_REGISTERED);

        // Create a new User with default reputation points
        let new_user = User {
            name,
            wallet_address: signer_address,
            role,
            reputation_points: 3,
            isBanned: false,
            balance: 0,
            jobs_created: 0,
            worker_completed_jobs: 0,
            creator_completed_jobs: 0,
        };
        
        // print(&new_user);
        // Add the user to the registry
        table::add(&mut registry.users, signer_address, new_user);
    }

    // Get the user's full profile including name, wallet address, role, and reputation points
    #[view]
    public fun get_user_profile(user_address: address): User acquires UserRegistry {
        let registry = borrow_global<UserRegistry>(GLOBAL_REGISTRY_ADDRESS);
        assert!(table::contains(&registry.users, user_address), E_NOT_REGISTERED);
        *table::borrow(&registry.users, user_address)
    }

    // Get the user's role (for convenience) 
    #[view]
    public fun get_user_role(user_address: address): u64 acquires UserRegistry {
        let user = Self::get_user_profile(user_address);
        user.role
    }

    #[view]
    public fun get_user_balance(user_address: address): u64 acquires UserRegistry {
        let user = Self::get_user_profile(user_address);
        user.balance
    }

    public fun set_user_balance(user_address: address, bal: u64) acquires UserRegistry {
        let registry = borrow_global_mut<UserRegistry>(GLOBAL_REGISTRY_ADDRESS);
        assert!(table::contains(&registry.users, user_address), E_NOT_REGISTERED);

        // Borrow the user's profile and directly set the balance to the new value
        let user = table::borrow_mut(&mut registry.users, user_address);
        user.balance = bal;
    }
        // Function to increment the completed_jobs by 1
    public fun job_completed_creator(user_address: address) acquires UserRegistry {
        let registry = borrow_global_mut<UserRegistry>(GLOBAL_REGISTRY_ADDRESS);
        assert!(table::contains(&registry.users, user_address), E_NOT_REGISTERED);

        // Borrow the user's profile and increment completed_jobs
        let user = table::borrow_mut(&mut registry.users, user_address);
        user.creator_completed_jobs = user.creator_completed_jobs + 1;
    }

    public fun job_completed_worker(user_address: address) acquires UserRegistry {
        let registry = borrow_global_mut<UserRegistry>(GLOBAL_REGISTRY_ADDRESS);
        assert!(table::contains(&registry.users, user_address), E_NOT_REGISTERED);

        // Borrow the user's profile and increment completed_jobs
        let user = table::borrow_mut(&mut registry.users, user_address);
        user.worker_completed_jobs = user.worker_completed_jobs + 1;
    }

    // Function to increment the jobs_created by 1
    public fun created_job(user_address: address) acquires UserRegistry {
        let registry = borrow_global_mut<UserRegistry>(GLOBAL_REGISTRY_ADDRESS);
        assert!(table::contains(&registry.users, user_address), E_NOT_REGISTERED);

        // Borrow the user's profile and increment jobs_created
        let user = table::borrow_mut(&mut registry.users, user_address);
        user.jobs_created = user.jobs_created + 1;
    }


    #[view]
    public fun get_user_status(user_address: address): bool acquires UserRegistry {
        let user = Self::get_user_profile(user_address);
        user.isBanned
    }
    
    public fun update_reputation(user_address: address) acquires UserRegistry {
        let registry = borrow_global_mut<UserRegistry>(GLOBAL_REGISTRY_ADDRESS);
        assert!(table::contains(&registry.users, user_address), E_NOT_REGISTERED);
        let user = table::borrow_mut(&mut registry.users, user_address);
        user.reputation_points = user.reputation_points - 1;
        if(user.reputation_points <= 0){
            user.isBanned = true;
        }
    }

    public entry fun withdraw_balance(account: &signer, withdraw_amount: u64) acquires UserRegistry {
        let user_address = signer::address_of(account);
        let registry = borrow_global_mut<UserRegistry>(GLOBAL_REGISTRY_ADDRESS);

        // Ensure the user is registered
        assert!(table::contains(&registry.users, user_address), E_NOT_REGISTERED);

        // Get the user's profile
        let user = table::borrow_mut(&mut registry.users, user_address);

        // Ensure the withdrawal amount is greater than or equal to 0.02 APT
        assert!(withdraw_amount >= MINIMUM_WITHDRAWAL_AMOUNT, E_INVALID_WITHDRAW_AMOUNT);

        // Ensure the user has enough balance to cover the withdrawal
        assert!(user.balance >= withdraw_amount, E_INSUFFICIENT_BALANCE);

        // Deduct the withdrawal amount from the user's balance
        my_adr::PaymentModule::send_funds(account,withdraw_amount);
        user.balance = user.balance - withdraw_amount;
    
    }

}
