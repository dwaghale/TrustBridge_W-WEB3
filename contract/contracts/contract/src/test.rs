#![cfg(test)]

use super::*;
use soroban_sdk::testutils::{Address as _, Events};
use soroban_sdk::{token, Address, Env};

fn create_token<'a>(
    e: &Env,
    admin: &Address,
) -> (token::Client<'a>, token::StellarAssetClient<'a>) {
    let sac = e.register_stellar_asset_contract_v2(admin.clone());
    (
        token::Client::new(e, &sac.address()),
        token::StellarAssetClient::new(e, &sac.address()),
    )
}

struct TestEnv {
    env: Env,
    contract_id: Address,
    token: token::Client<'static>,
    buyer: Address,
    seller: Address,
    arbitrator: Address,
}

fn setup_full() -> TestEnv {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);
    client.init();
    let admin = Address::generate(&env);
    let (token, sac) = create_token(&env, &admin);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    let arbitrator = Address::generate(&env);
    sac.mint(&buyer, &1000_0000000);
    TestEnv {
        env,
        contract_id,
        token,
        buyer,
        seller,
        arbitrator,
    }
}

fn create_default_escrow(t: &TestEnv, amount: i128) -> u64 {
    let client = EscrowContractClient::new(&t.env, &t.contract_id);
    client.create(&t.buyer, &t.seller, &t.arbitrator, &t.token.address, &amount)
}

fn get_client(t: &TestEnv) -> EscrowContractClient {
    EscrowContractClient::new(&t.env, &t.contract_id)
}

#[test]
fn test_init() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);
    client.init();
    assert_eq!(client.get_count(), 0);
}

#[test]
fn test_create_escrow() {
    let t = setup_full();
    let client = get_client(&t);
    let id = client.create(&t.buyer, &t.seller, &t.arbitrator, &t.token.address, &500_0000000);
    assert_eq!(id, 1);
    assert_eq!(client.get_count(), 1);
    let escrow = client.get_escrow(&1);
    assert_eq!(escrow.buyer, t.buyer);
    assert_eq!(escrow.seller, t.seller);
    assert_eq!(escrow.arbitrator, t.arbitrator);
    assert_eq!(escrow.amount, 500_0000000);
    assert_eq!(escrow.status, STATUS_PENDING);
    assert!(!escrow.buyer_approved);
    assert!(!escrow.seller_approved);
    assert_eq!(t.token.balance(&t.contract_id), 500_0000000);
    assert_eq!(t.token.balance(&t.buyer), 500_0000000);
}

#[test]
fn test_approve_happy_path() {
    let t = setup_full();
    let client = get_client(&t);
    let id = client.create(&t.buyer, &t.seller, &t.arbitrator, &t.token.address, &500_0000000);
    client.approve(&id, &t.buyer);
    let escrow = client.get_escrow(&id);
    assert!(escrow.buyer_approved);
    assert!(!escrow.seller_approved);
    assert_eq!(escrow.status, STATUS_PENDING);

    client.approve(&id, &t.seller);
    let escrow = client.get_escrow(&id);
    assert_eq!(escrow.status, STATUS_RELEASED);
    assert_eq!(t.token.balance(&t.seller), 500_0000000);
    assert_eq!(t.token.balance(&t.contract_id), 0);
}

#[test]
fn test_approve_reverse_order() {
    let t = setup_full();
    let client = get_client(&t);
    let id = client.create(&t.buyer, &t.seller, &t.arbitrator, &t.token.address, &500_0000000);
    client.approve(&id, &t.seller);
    client.approve(&id, &t.buyer);
    let escrow = client.get_escrow(&id);
    assert_eq!(escrow.status, STATUS_RELEASED);
    assert_eq!(t.token.balance(&t.seller), 500_0000000);
}

#[test]
fn test_approve_twice_fails() {
    let t = setup_full();
    let client = get_client(&t);
    let id = create_default_escrow(&t, 500_0000000);
    client.approve(&id, &t.buyer);
    let result = client.try_approve(&id, &t.buyer);
    assert!(result.is_err());
}

#[test]
fn test_flag_dispute() {
    let t = setup_full();
    let client = get_client(&t);
    let id = create_default_escrow(&t, 500_0000000);
    client.flag_dispute(&id, &t.buyer);
    let escrow = client.get_escrow(&id);
    assert_eq!(escrow.status, STATUS_DISPUTED);
}

#[test]
fn test_resolve_dispute_partial_refund() {
    let t = setup_full();
    let client = get_client(&t);
    let id = create_default_escrow(&t, 500_0000000);
    client.flag_dispute(&id, &t.buyer);
    client.resolve(&id, &t.arbitrator, &200_0000000, &300_0000000);
    let escrow = client.get_escrow(&id);
    assert_eq!(escrow.status, STATUS_REFUNDED);
    assert_eq!(t.token.balance(&t.buyer), 700_0000000);
    assert_eq!(t.token.balance(&t.seller), 300_0000000);
    assert_eq!(t.token.balance(&t.contract_id), 0);
}

#[test]
fn test_resolve_dispute_full_refund() {
    let t = setup_full();
    let client = get_client(&t);
    let id = create_default_escrow(&t, 500_0000000);
    client.flag_dispute(&id, &t.seller);
    client.resolve(&id, &t.arbitrator, &500_0000000, &0);
    assert_eq!(t.token.balance(&t.buyer), 1000_0000000);
    assert_eq!(t.token.balance(&t.seller), 0);
}

#[test]
fn test_refund_before_approval() {
    let t = setup_full();
    let client = get_client(&t);
    let id = create_default_escrow(&t, 500_0000000);
    client.refund(&id, &t.buyer);
    let escrow = client.get_escrow(&id);
    assert_eq!(escrow.status, STATUS_REFUNDED);
    assert_eq!(t.token.balance(&t.buyer), 1000_0000000);
    assert_eq!(t.token.balance(&t.contract_id), 0);
}

#[test]
fn test_events_emitted() {
    let t = setup_full();
    let client = get_client(&t);
    let id = create_default_escrow(&t, 500_0000000);
    let escrow = client.get_escrow(&id);
    assert_eq!(escrow.amount, 500_0000000);
    let _events = t.env.events().all();
}

#[test]
fn test_non_party_cannot_approve() {
    let t = setup_full();
    let client = get_client(&t);
    let id = create_default_escrow(&t, 500_0000000);
    let stranger = Address::generate(&t.env);
    let result = client.try_approve(&id, &stranger);
    assert!(result.is_err());
}

#[test]
fn test_non_party_cannot_flag_dispute() {
    let t = setup_full();
    let client = get_client(&t);
    let id = create_default_escrow(&t, 500_0000000);
    let stranger = Address::generate(&t.env);
    let result = client.try_flag_dispute(&id, &stranger);
    assert!(result.is_err());
}

#[test]
fn test_only_arbitrator_can_resolve() {
    let t = setup_full();
    let client = get_client(&t);
    let id = create_default_escrow(&t, 500_0000000);
    client.flag_dispute(&id, &t.buyer);
    let stranger = Address::generate(&t.env);
    let result = client.try_resolve(&id, &stranger, &200_0000000, &300_0000000);
    assert!(result.is_err());
}

#[test]
fn test_resolve_wrong_amounts_fails() {
    let t = setup_full();
    let client = get_client(&t);
    let id = create_default_escrow(&t, 500_0000000);
    client.flag_dispute(&id, &t.buyer);
    let result = client.try_resolve(&id, &t.arbitrator, &100_0000000, &100_0000000);
    assert!(result.is_err());
}

#[test]
fn test_multiple_escrows() {
    let t = setup_full();
    let client = get_client(&t);
    let seller1 = Address::generate(&t.env);
    let seller2 = Address::generate(&t.env);
    let id1 = client.create(&t.buyer, &seller1, &t.arbitrator, &t.token.address, &200_0000000);
    let id2 = client.create(&t.buyer, &seller2, &t.arbitrator, &t.token.address, &300_0000000);
    assert_eq!(id1, 1);
    assert_eq!(id2, 2);
    assert_eq!(client.get_count(), 2);
    assert_eq!(client.get_escrow(&1).seller, seller1);
    assert_eq!(client.get_escrow(&2).seller, seller2);
}
