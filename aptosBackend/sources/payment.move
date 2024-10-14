module my_adr::PaymentModule {
    use std::signer;
    use std::aptos_coin::AptosCoin;
    use std::debug::print;
    use std::string::utf8;
    // use std::aptos_account;
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::managed_coin;
    // use aptos_framework::byte_conversions;

    const ADMIN: address = @0x1dc03758f2c3a17cec451cfef4b7f50fd530c10400731aa2c22abcde7b678bd6;
    friend my_adr::job_management;
    friend my_adr::user_registry;

    const E_ALREADY_INITIALIZED:u64 = 1;
    const E_INSUFFICIENT_BALANCE: u64 = 3;
    const E_PAYMENT_NOT_INITIALIZED: u64 = 2;

    #[test_only]
    use std::aptos_coin;

    struct Balance has key, store {
        amount: u64,
    }
    struct ResourceInfo has key {
        source: address,
        resource_cap: account::SignerCapability,
        vault: address,
    }
    struct InitFlag has key { is_initialized: bool }

    public entry fun initialize(account: &signer, seeds: vector<u8>) {
        let add = signer::address_of(account);

        // Ensure initialization has not occurred before
        assert!(!exists<InitFlag>(add), E_ALREADY_INITIALIZED);

        // Create InitFlag and Balance resources
        move_to(account, InitFlag { is_initialized: true });
        move_to(account, Balance { amount: 0 });

        // Create resource account for vault and register with AptosCoin
        let (vault, vault_signer_cap) = account::create_resource_account(account, seeds);
        // let resource_account_from_cap = account::create_signer_with_capability(&vault_signer_cap);
        move_to(account, ResourceInfo {
            resource_cap: vault_signer_cap,
            source: add,
            vault: signer::address_of(&vault),
        });

        managed_coin::register<AptosCoin>(&vault);
    }

    #[view]
    public fun getBalance(): u64 acquires ResourceInfo {
        let vault_info = borrow_global<ResourceInfo>(ADMIN);
        let vault_addr = vault_info.vault;
        coin::balance<AptosCoin>(vault_addr)
    }

    public(friend) entry fun deposit(sender: &signer, amount: u64) acquires ResourceInfo {
        let sender_addr = signer::address_of(sender);
        let sender_balance = coin::balance<AptosCoin>(sender_addr);
        let admin = ADMIN;

        // Ensure the user has enough balance to deposit
        assert!(amount <= sender_balance, E_INSUFFICIENT_BALANCE);
        assert!(exists<ResourceInfo>(admin), E_PAYMENT_NOT_INITIALIZED);

        // Retrieve the vault information from the contract
        let vault_info = borrow_global<ResourceInfo>(admin);
        let vault_addr = vault_info.vault;

        // Transfer the amount from the sender to the vault
        coin::transfer<AptosCoin>(sender, vault_addr, amount);

        // Debug print statement for deposit confirmation
        print(&utf8(b"Deposited "));
        // print(&amount);
        print(&utf8(b" to contract. New contract balance: "));
        // print(&recipient_balance.amount);
        print(&utf8(b"\n"));
    }

    public(friend) entry fun send_funds(receiver: &signer,amount:u64) acquires  ResourceInfo {
        let fixed_amount = amount;
        let adr = signer::address_of(receiver);
        let initializer = ADMIN;

        let init_info = borrow_global<ResourceInfo>(initializer);

        // Ensure the initializer has enough balance

        let resource_account_from_cap = account::create_signer_with_capability(&init_info.resource_cap);

        let acc_bal = coin::balance<AptosCoin>(signer::address_of(&resource_account_from_cap));
        assert!(acc_bal >= fixed_amount, E_INSUFFICIENT_BALANCE);

        coin::transfer<AptosCoin>(&resource_account_from_cap, adr, fixed_amount);

        // Print for debugging
        print(&utf8(b"Sent "));
    }

}
