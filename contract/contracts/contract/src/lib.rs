#![no_std]
use soroban_sdk::{contract, contractimpl, contractevent, contracttype, token, Address, Env};

const STATUS_PENDING: u32 = 0;
const STATUS_DISPUTED: u32 = 1;
const STATUS_RELEASED: u32 = 2;
const STATUS_REFUNDED: u32 = 3;

#[contracttype]
pub enum DataKey {
    Escrow(u64),
    EscrowCount,
}

#[contracttype]
#[derive(Clone)]
pub struct Escrow {
    pub buyer: Address,
    pub seller: Address,
    pub arbitrator: Address,
    pub token: Address,
    pub amount: i128,
    pub status: u32,
    pub buyer_approved: bool,
    pub seller_approved: bool,
}

#[contractevent(data_format = "single-value")]
pub struct Created {
    #[topic]
    id: u64,
    #[topic]
    buyer: Address,
    #[topic]
    seller: Address,
    amount: i128,
}

#[contractevent(data_format = "single-value")]
pub struct Approved {
    #[topic]
    id: u64,
    #[topic]
    caller: Address,
}

#[contractevent(data_format = "single-value")]
pub struct Released {
    #[topic]
    id: u64,
    #[topic]
    seller: Address,
    amount: i128,
}

#[contractevent(data_format = "single-value")]
pub struct Disputed {
    #[topic]
    id: u64,
    #[topic]
    caller: Address,
}

#[contractevent(data_format = "vec")]
pub struct Resolved {
    #[topic]
    id: u64,
    buyer_amount: i128,
    seller_amount: i128,
}

#[contractevent(data_format = "single-value")]
pub struct Refunded {
    #[topic]
    id: u64,
    #[topic]
    buyer: Address,
    amount: i128,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    pub fn init(env: Env) {
        env.storage().instance().set(&DataKey::EscrowCount, &0u64);
    }

    pub fn create(
        env: Env,
        buyer: Address,
        seller: Address,
        arbitrator: Address,
        token: Address,
        amount: i128,
    ) -> u64 {
        buyer.require_auth();
        assert!(amount > 0, "amount must be positive");
        token::Client::new(&env, &token).transfer(&buyer, &env.current_contract_address(), &amount);
        let mut count: u64 = env.storage().instance().get(&DataKey::EscrowCount).unwrap_or(0);
        count += 1;
        let escrow = Escrow {
            buyer: buyer.clone(),
            seller: seller.clone(),
            arbitrator,
            token,
            amount,
            status: STATUS_PENDING,
            buyer_approved: false,
            seller_approved: false,
        };
        env.storage().instance().set(&DataKey::Escrow(count), &escrow);
        env.storage().instance().set(&DataKey::EscrowCount, &count);
        Created {
            id: count,
            buyer,
            seller,
            amount,
        }
        .publish(&env);
        count
    }

    pub fn approve(env: Env, id: u64, caller: Address) {
        caller.require_auth();
        let mut escrow: Escrow = env.storage().instance().get(&DataKey::Escrow(id)).expect("not found");
        assert!(escrow.status == STATUS_PENDING, "not pending");
        if caller == escrow.buyer {
            assert!(!escrow.buyer_approved, "already approved");
            escrow.buyer_approved = true;
        } else if caller == escrow.seller {
            assert!(!escrow.seller_approved, "already approved");
            escrow.seller_approved = true;
        } else {
            panic!("not a party");
        }
        Approved {
            id,
            caller: caller.clone(),
        }
        .publish(&env);
        if escrow.buyer_approved && escrow.seller_approved {
            escrow.status = STATUS_RELEASED;
            token::Client::new(&env, &escrow.token).transfer(
                &env.current_contract_address(),
                &escrow.seller,
                &escrow.amount,
            );
            Released {
                id,
                seller: escrow.seller.clone(),
                amount: escrow.amount,
            }
            .publish(&env);
        }
        env.storage().instance().set(&DataKey::Escrow(id), &escrow);
    }

    pub fn flag_dispute(env: Env, id: u64, caller: Address) {
        caller.require_auth();
        let mut escrow: Escrow = env.storage().instance().get(&DataKey::Escrow(id)).expect("not found");
        assert!(escrow.status == STATUS_PENDING, "not pending");
        assert!(
            caller == escrow.buyer || caller == escrow.seller,
            "not a party"
        );
        escrow.status = STATUS_DISPUTED;
        env.storage().instance().set(&DataKey::Escrow(id), &escrow);
        Disputed { id, caller }.publish(&env);
    }

    pub fn resolve(
        env: Env,
        id: u64,
        caller: Address,
        buyer_amount: i128,
        seller_amount: i128,
    ) {
        caller.require_auth();
        let mut escrow: Escrow = env.storage().instance().get(&DataKey::Escrow(id)).expect("not found");
        assert!(escrow.status == STATUS_DISPUTED, "not disputed");
        assert!(caller == escrow.arbitrator, "only arbitrator");
        assert!(
            buyer_amount + seller_amount == escrow.amount,
            "amounts must sum"
        );
        if buyer_amount > 0 {
            token::Client::new(&env, &escrow.token).transfer(
                &env.current_contract_address(),
                &escrow.buyer,
                &buyer_amount,
            );
        }
        if seller_amount > 0 {
            token::Client::new(&env, &escrow.token).transfer(
                &env.current_contract_address(),
                &escrow.seller,
                &seller_amount,
            );
        }
        escrow.status = STATUS_REFUNDED;
        env.storage().instance().set(&DataKey::Escrow(id), &escrow);
        Resolved {
            id,
            buyer_amount,
            seller_amount,
        }
        .publish(&env);
    }

    pub fn refund(env: Env, id: u64, caller: Address) {
        caller.require_auth();
        let mut escrow: Escrow = env.storage().instance().get(&DataKey::Escrow(id)).expect("not found");
        assert!(escrow.status == STATUS_PENDING, "not pending");
        assert!(caller == escrow.buyer, "only buyer");
        assert!(!escrow.buyer_approved, "already approved");
        escrow.status = STATUS_REFUNDED;
        token::Client::new(&env, &escrow.token).transfer(
            &env.current_contract_address(),
            &escrow.buyer,
            &escrow.amount,
        );
        env.storage().instance().set(&DataKey::Escrow(id), &escrow);
        Refunded {
            id,
            buyer: escrow.buyer,
            amount: escrow.amount,
        }
        .publish(&env);
    }

    pub fn get_escrow(env: Env, id: u64) -> Escrow {
        env.storage()
            .instance()
            .get(&DataKey::Escrow(id))
            .expect("not found")
    }

    pub fn get_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::EscrowCount)
            .unwrap_or(0)
    }
}

mod test;
