#include "fa2_multi_nft_asset.mligo"

type contract_info = {
  owner: address;
  name: string;
}

type storage = (address, contract_info) big_map

let create_contract : (key_hash option * tez * nft_asset_storage) -> (operation * address) =
  [%Michelson ( {|
    {
        UNPPAIIR ;
        CREATE_CONTRACT
        { parameter
    (or (or (or %admin (or (unit %confirm_admin) (bool %pause)) (address %set_admin))
            (or %assets
               (or (pair %balance_of
                      (list %requests (pair (address %owner) (nat %token_id)))
                      (contract %callback
                         (list (pair (pair %request (address %owner) (nat %token_id)) (nat %balance)))))
                   (list %transfer
                      (pair (address %from_)
                            (list %txs (pair (address %to_) (pair (nat %token_id) (nat %amount)))))))
               (list %update_operators
                  (or (pair %add_operator (address %owner) (pair (address %operator) (nat %token_id)))
                      (pair %remove_operator (address %owner) (pair (address %operator) (nat %token_id)))))))
        (list %mint
           (pair (pair %token_metadata (nat %token_id) (map %token_info string bytes))
                 (address %owner)))) ;
  storage
    (pair (pair (pair %admin (pair (address %admin) (bool %paused)) (option %pending_admin address))
                (pair %assets
                   (pair (big_map %ledger nat address) (nat %next_token_id))
                   (pair (big_map %operators (pair address (pair address nat)) unit)
                         (big_map %token_metadata
                            nat
                            (pair (nat %token_id) (map %token_info string bytes))))))
          (big_map %metadata string bytes)) ;
  code { PUSH string "FA2_INSUFFICIENT_BALANCE" ;
         LAMBDA
           (pair string
                 (pair (pair (list (pair (option address) (list (pair (option address) (pair nat nat)))))
                             (lambda
                                (pair (pair address address) (pair nat (big_map (pair address (pair address nat)) unit)))
                                unit))
                       (pair (pair (big_map nat address) nat)
                             (pair (big_map (pair address (pair address nat)) unit)
                                   (big_map nat (pair nat (map string bytes)))))))
           (pair (list operation)
                 (pair (pair (big_map nat address) nat)
                       (pair (big_map (pair address (pair address nat)) unit)
                             (big_map nat (pair nat (map string bytes))))))
           { DUP ;
             CDR ;
             SWAP ;
             CAR ;
             SWAP ;
             DUP ;
             CDR ;
             DUP ;
             CAR ;
             CAR ;
             SWAP ;
             DUP ;
             DUG 2 ;
             CDR ;
             CAR ;
             PAIR ;
             DIG 2 ;
             DUP ;
             DUG 3 ;
             CAR ;
             CDR ;
             DIG 3 ;
             CAR ;
             CAR ;
             PAIR ;
             PAIR ;
             DUP ;
             CDR ;
             CDR ;
             SWAP ;
             DUP ;
             DUG 2 ;
             CAR ;
             CAR ;
             ITER { DUP ;
                    DUG 2 ;
                    CDR ;
                    ITER { DIG 2 ;
                           DUP ;
                           DUG 3 ;
                           CAR ;
                           IF_NONE
                             { UNIT }
                             { DIG 4 ;
                               DUP ;
                               DUG 5 ;
                               CDR ;
                               CAR ;
                               DIG 2 ;
                               DUP ;
                               DUG 3 ;
                               CDR ;
                               CAR ;
                               PAIR ;
                               SENDER ;
                               DIG 2 ;
                               PAIR ;
                               PAIR ;
                               DIG 4 ;
                               DUP ;
                               DUG 5 ;
                               CAR ;
                               CDR ;
                               SWAP ;
                               EXEC } ;
                           DROP ;
                           PUSH nat 1 ;
                           SWAP ;
                           DUP ;
                           DUG 2 ;
                           CDR ;
                           CDR ;
                           COMPARE ;
                           GT ;
                           IF { DROP 2 ; DIG 3 ; DUP ; DUG 4 ; FAILWITH }
                              { PUSH nat 0 ;
                                SWAP ;
                                DUP ;
                                DUG 2 ;
                                CDR ;
                                CDR ;
                                COMPARE ;
                                EQ ;
                                IF { DROP }
                                   { DUP ;
                                     DUG 2 ;
                                     CDR ;
                                     CAR ;
                                     DIG 3 ;
                                     DUP ;
                                     DUG 4 ;
                                     CAR ;
                                     PAIR ;
                                     PAIR ;
                                     DUP ;
                                     CDR ;
                                     SWAP ;
                                     DUP ;
                                     DUG 2 ;
                                     CAR ;
                                     CDR ;
                                     DIG 2 ;
                                     CAR ;
                                     CAR ;
                                     IF_NONE
                                       { DROP }
                                       { DIG 2 ;
                                         DUP ;
                                         DUG 3 ;
                                         DIG 2 ;
                                         DUP ;
                                         DUG 3 ;
                                         GET ;
                                         IF_NONE
                                           { DROP 3 ; DIG 4 ; DUP ; DUG 5 ; FAILWITH }
                                           { COMPARE ;
                                             EQ ;
                                             IF { NONE address ; SWAP ; UPDATE }
                                                { DROP 2 ; DIG 4 ; DUP ; DUG 5 ; FAILWITH } } } ;
                                     SWAP ;
                                     DUP ;
                                     DUG 2 ;
                                     CDR ;
                                     CAR ;
                                     DIG 2 ;
                                     CAR ;
                                     PAIR ;
                                     PAIR ;
                                     DUP ;
                                     CDR ;
                                     SWAP ;
                                     DUP ;
                                     DUG 2 ;
                                     CAR ;
                                     CAR ;
                                     IF_NONE
                                       { SWAP ; DROP }
                                       { DIG 2 ; CAR ; CDR ; SWAP ; SOME ; SWAP ; UPDATE } } } } ;
                    SWAP ;
                    DROP } ;
             SWAP ;
             DROP ;
             DIG 2 ;
             DROP ;
             SWAP ;
             DUP ;
             DUG 2 ;
             CDR ;
             DIG 2 ;
             CAR ;
             CDR ;
             DIG 2 ;
             PAIR ;
             PAIR ;
             NIL operation ;
             PAIR } ;
         SWAP ;
         APPLY ;
         LAMBDA
           (pair (pair address bool) (option address))
           unit
           { CAR ;
             CAR ;
             SENDER ;
             COMPARE ;
             NEQ ;
             IF { PUSH string "NOT_AN_ADMIN" ; FAILWITH } { UNIT } } ;
         DIG 2 ;
         DUP ;
         DUG 3 ;
         CDR ;
         DIG 3 ;
         CAR ;
         IF_LEFT
           { IF_LEFT
               { DIG 3 ;
                 DROP ;
                 SWAP ;
                 DUP ;
                 DUG 2 ;
                 CAR ;
                 CAR ;
                 SWAP ;
                 IF_LEFT
                   { IF_LEFT
                       { DROP ;
                         DIG 2 ;
                         DROP ;
                         DUP ;
                         CDR ;
                         IF_NONE
                           { DROP ; PUSH string "NO_PENDING_ADMIN" ; FAILWITH }
                           { SENDER ;
                             COMPARE ;
                             EQ ;
                             IF { NONE address ; SWAP ; CAR ; CDR ; SENDER ; PAIR ; PAIR }
                                { DROP ; PUSH string "NOT_A_PENDING_ADMIN" ; FAILWITH } } ;
                         NIL operation ;
                         PAIR }
                       { SWAP ;
                         DUP ;
                         DUG 2 ;
                         DIG 4 ;
                         SWAP ;
                         EXEC ;
                         DROP ;
                         PAIR ;
                         DUP ;
                         CDR ;
                         DUP ;
                         CDR ;
                         DIG 2 ;
                         CAR ;
                         DIG 2 ;
                         CAR ;
                         CAR ;
                         PAIR ;
                         PAIR ;
                         NIL operation ;
                         PAIR } }
                   { SWAP ;
                     DUP ;
                     DUG 2 ;
                     DIG 4 ;
                     SWAP ;
                     EXEC ;
                     DROP ;
                     PAIR ;
                     DUP ;
                     CAR ;
                     SOME ;
                     SWAP ;
                     CDR ;
                     CAR ;
                     PAIR ;
                     NIL operation ;
                     PAIR } ;
                 SWAP ;
                 DUP ;
                 DUG 2 ;
                 CDR ;
                 DIG 2 ;
                 CAR ;
                 CDR ;
                 DIG 2 ;
                 DUP ;
                 DUG 3 ;
                 CDR ;
                 PAIR ;
                 PAIR ;
                 SWAP ;
                 CAR ;
                 PAIR }
               { DIG 2 ;
                 DROP ;
                 SWAP ;
                 DUP ;
                 DUG 2 ;
                 CAR ;
                 CAR ;
                 CAR ;
                 CDR ;
                 IF { PUSH string "PAUSED" ; FAILWITH } {} ;
                 SWAP ;
                 DUP ;
                 DUG 2 ;
                 CAR ;
                 CDR ;
                 SWAP ;
                 IF_LEFT
                   { IF_LEFT
                       { DIG 3 ;
                         DROP ;
                         SWAP ;
                         DUP ;
                         DUG 2 ;
                         CAR ;
                         CAR ;
                         SWAP ;
                         PAIR ;
                         DUP ;
                         CAR ;
                         DUP ;
                         CAR ;
                         MAP { DIG 2 ;
                               DUP ;
                               DUG 3 ;
                               CDR ;
                               SWAP ;
                               DUP ;
                               DUG 2 ;
                               CDR ;
                               GET ;
                               IF_NONE
                                 { DROP ; PUSH string "FA2_TOKEN_UNDEFINED" ; FAILWITH }
                                 { SWAP ;
                                   DUP ;
                                   DUG 2 ;
                                   CAR ;
                                   SWAP ;
                                   COMPARE ;
                                   EQ ;
                                   IF { PUSH nat 1 } { PUSH nat 0 } ;
                                   SWAP ;
                                   PAIR } } ;
                         DIG 2 ;
                         DROP ;
                         SWAP ;
                         CDR ;
                         PUSH mutez 0 ;
                         DIG 2 ;
                         TRANSFER_TOKENS ;
                         SWAP ;
                         NIL operation ;
                         DIG 2 ;
                         CONS ;
                         PAIR }
                       { MAP { DUP ;
                               CDR ;
                               MAP { DUP ;
                                     CDR ;
                                     CDR ;
                                     SWAP ;
                                     DUP ;
                                     DUG 2 ;
                                     CDR ;
                                     CAR ;
                                     PAIR ;
                                     SWAP ;
                                     CAR ;
                                     SOME ;
                                     PAIR } ;
                               SWAP ;
                               CAR ;
                               SOME ;
                               PAIR } ;
                         SWAP ;
                         LAMBDA
                           (pair (pair address address) (pair nat (big_map (pair address (pair address nat)) unit)))
                           unit
                           { DUP ;
                             CAR ;
                             CAR ;
                             SWAP ;
                             DUP ;
                             DUG 2 ;
                             CAR ;
                             CDR ;
                             DUP ;
                             DIG 2 ;
                             DUP ;
                             DUG 3 ;
                             COMPARE ;
                             EQ ;
                             IF { DROP 3 ; UNIT }
                                { DIG 2 ;
                                  DUP ;
                                  DUG 3 ;
                                  CDR ;
                                  CDR ;
                                  DIG 3 ;
                                  CDR ;
                                  CAR ;
                                  DIG 2 ;
                                  PAIR ;
                                  DIG 2 ;
                                  PAIR ;
                                  MEM ;
                                  IF { UNIT } { PUSH string "FA2_NOT_OPERATOR" ; FAILWITH } } } ;
                         DIG 2 ;
                         PAIR ;
                         PAIR ;
                         DIG 2 ;
                         SWAP ;
                         EXEC } }
                   { DIG 3 ;
                     DROP ;
                     SWAP ;
                     DUP ;
                     DUG 2 ;
                     CDR ;
                     CAR ;
                     SWAP ;
                     PAIR ;
                     SENDER ;
                     SWAP ;
                     DUP ;
                     DUG 2 ;
                     CDR ;
                     DIG 2 ;
                     CAR ;
                     ITER { SWAP ;
                            PAIR ;
                            DUP ;
                            CDR ;
                            DIG 2 ;
                            DUP ;
                            DUG 3 ;
                            SWAP ;
                            DUP ;
                            DUG 2 ;
                            IF_LEFT {} {} ;
                            CAR ;
                            COMPARE ;
                            EQ ;
                            IF {} { PUSH string "FA2_NOT_OWNER" ; FAILWITH } ;
                            SWAP ;
                            CAR ;
                            SWAP ;
                            IF_LEFT
                              { SWAP ;
                                UNIT ;
                                SOME ;
                                DIG 2 ;
                                DUP ;
                                DUG 3 ;
                                CDR ;
                                CDR ;
                                DIG 3 ;
                                DUP ;
                                DUG 4 ;
                                CDR ;
                                CAR ;
                                PAIR ;
                                DIG 3 ;
                                CAR ;
                                PAIR ;
                                UPDATE }
                              { DUP ;
                                DUG 2 ;
                                CDR ;
                                CDR ;
                                DIG 2 ;
                                DUP ;
                                DUG 3 ;
                                CDR ;
                                CAR ;
                                PAIR ;
                                DIG 2 ;
                                CAR ;
                                PAIR ;
                                NONE unit ;
                                SWAP ;
                                UPDATE } } ;
                     SWAP ;
                     DROP ;
                     SWAP ;
                     DUP ;
                     DUG 2 ;
                     CDR ;
                     CDR ;
                     SWAP ;
                     PAIR ;
                     SWAP ;
                     CAR ;
                     PAIR ;
                     NIL operation ;
                     PAIR } ;
                 SWAP ;
                 DUP ;
                 DUG 2 ;
                 CDR ;
                 SWAP ;
                 DUP ;
                 DUG 2 ;
                 CDR ;
                 DIG 3 ;
                 CAR ;
                 CAR ;
                 PAIR ;
                 PAIR ;
                 SWAP ;
                 CAR ;
                 PAIR } }
           { SWAP ;
             DUP ;
             DUG 2 ;
             CAR ;
             CAR ;
             DIG 3 ;
             SWAP ;
             EXEC ;
             DROP ;
             SWAP ;
             DUP ;
             DUG 2 ;
             CAR ;
             CDR ;
             SWAP ;
             PAIR ;
             DUP ;
             CDR ;
             NIL (pair (option address) (pair nat nat)) ;
             PAIR ;
             SWAP ;
             CAR ;
             ITER { DUP ;
                    CAR ;
                    CAR ;
                    DIG 2 ;
                    DUP ;
                    DUG 3 ;
                    CDR ;
                    CAR ;
                    CDR ;
                    SWAP ;
                    DUP ;
                    DUG 2 ;
                    COMPARE ;
                    LT ;
                    IF { DROP 3 ; PUSH string "FA2_INVALID_TOKEN_ID" ; FAILWITH }
                       { DIG 2 ;
                         DUP ;
                         DUG 3 ;
                         CDR ;
                         DIG 3 ;
                         DUP ;
                         DUG 4 ;
                         CDR ;
                         CDR ;
                         CDR ;
                         DIG 3 ;
                         DUP ;
                         DUG 4 ;
                         CAR ;
                         DIG 3 ;
                         DUP ;
                         DUG 4 ;
                         SWAP ;
                         SOME ;
                         SWAP ;
                         UPDATE ;
                         SWAP ;
                         DUP ;
                         DUG 2 ;
                         CDR ;
                         CAR ;
                         PAIR ;
                         SWAP ;
                         CAR ;
                         PAIR ;
                         DUP ;
                         CDR ;
                         PUSH nat 1 ;
                         DIG 3 ;
                         DUP ;
                         DUG 4 ;
                         ADD ;
                         DIG 2 ;
                         CAR ;
                         CAR ;
                         PAIR ;
                         PAIR ;
                         DIG 3 ;
                         CAR ;
                         PUSH nat 1 ;
                         DIG 3 ;
                         PAIR ;
                         DIG 3 ;
                         CDR ;
                         SOME ;
                         PAIR ;
                         CONS ;
                         PAIR } } ;
             DUP ;
             CDR ;
             LAMBDA
               (pair (pair address address) (pair nat (big_map (pair address (pair address nat)) unit)))
               unit
               { DROP ; UNIT } ;
             NIL (pair (option address) (list (pair (option address) (pair nat nat)))) ;
             DIG 3 ;
             CAR ;
             NONE address ;
             PAIR ;
             CONS ;
             PAIR ;
             PAIR ;
             DIG 2 ;
             SWAP ;
             EXEC ;
             SWAP ;
             DUP ;
             DUG 2 ;
             CDR ;
             SWAP ;
             DUP ;
             DUG 2 ;
             CDR ;
             DIG 3 ;
             CAR ;
             CAR ;
             PAIR ;
             PAIR ;
             SWAP ;
             CAR ;
             PAIR } } }


        ;
        PAIR
    }
  |} : (key_hash option * tez * nft_asset_storage) -> (operation * address))]


let factory_main (name, storage : string * storage) : operation list * storage =
  let init_storage : nft_asset_storage = {
    assets = {
      ledger = (Big_map.empty : ledger);
      token_metadata = (Big_map.empty : nft_meta);
      next_token_id = 0n;
      operators = (Big_map.empty : operator_storage);
    };
    admin = {
      admin = Tezos.sender;
      pending_admin = (None : address option);
      paused = false;
      };
    metadata = (Big_map.empty : (string, bytes) big_map);
  } in
 let op, fa2_nft = create_contract ((None: key_hash option), 0tez, init_storage) in
 let contract_info = { owner = Tezos.sender; name = name } in
 let new_storage = Big_map.add fa2_nft contract_info storage in
 [op], new_storage
