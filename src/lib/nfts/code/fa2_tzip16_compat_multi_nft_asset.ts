const code = `
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
    (pair (pair (option %admin
                   (pair (pair (address %admin) (bool %paused)) (option %pending_admin address)))
                (pair %assets
                   (pair (big_map %ledger nat address) (nat %next_token_id))
                   (pair (big_map %operators (pair address (pair address nat)) unit)
                         (big_map %token_metadata nat (pair (nat %token_id) (map %token_info string bytes))))))
          (big_map %metadata string bytes)) ;
  code { PUSH string "FA2_TOKEN_UNDEFINED" ;
         PUSH string "FA2_INSUFFICIENT_BALANCE" ;
         SWAP ;
         DUP ;
         DUG 2 ;
         SWAP ;
         PAIR ;
         LAMBDA
           (pair (pair string string)
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
           { UNPAIR ;
             UNPAIR ;
             DIG 2 ;
             UNPAIR ;
             UNPAIR ;
             DUP 3 ;
             CAR ;
             CAR ;
             DUP 4 ;
             CDR ;
             CAR ;
             PAIR ;
             DUG 2 ;
             DUP ;
             DUG 3 ;
             DIG 2 ;
             UNPAIR ;
             SWAP ;
             DIG 2 ;
             ITER { DUP ;
                    DUG 2 ;
                    CDR ;
                    ITER { SWAP ;
                           DUP 3 ;
                           CAR ;
                           IF_NONE
                             { UNIT }
                             { DUP 5 ;
                               DUP 4 ;
                               CDR ;
                               CAR ;
                               PAIR ;
                               SENDER ;
                               DIG 2 ;
                               PAIR ;
                               PAIR ;
                               DUP 6 ;
                               SWAP ;
                               EXEC } ;
                           DROP ;
                           PUSH nat 1 ;
                           DUP 3 ;
                           CDR ;
                           CDR ;
                           COMPARE ;
                           GT ;
                           IF { DROP 2 ; DUP 6 ; FAILWITH }
                              { PUSH nat 0 ;
                                DUP 3 ;
                                CDR ;
                                CDR ;
                                COMPARE ;
                                EQ ;
                                IF { DUP ;
                                     DIG 2 ;
                                     CDR ;
                                     CAR ;
                                     GET ;
                                     IF_NONE { DROP ; DUP 7 ; FAILWITH } { DROP } }
                                   { SWAP ;
                                     DUP ;
                                     DUG 2 ;
                                     CDR ;
                                     CAR ;
                                     DUP 4 ;
                                     CAR ;
                                     IF_NONE
                                       { DROP }
                                       { DUP 3 ;
                                         DUP 3 ;
                                         GET ;
                                         IF_NONE
                                           { DROP 3 ; DUP 8 ; FAILWITH }
                                           { COMPARE ;
                                             EQ ;
                                             IF { NONE address ; SWAP ; UPDATE } { DROP 2 ; DUP 7 ; FAILWITH } } } ;
                                     SWAP ;
                                     DUP ;
                                     DUG 2 ;
                                     CDR ;
                                     CAR ;
                                     DIG 2 ;
                                     CAR ;
                                     IF_NONE { DROP } { DIG 2 ; SWAP ; DIG 2 ; SWAP ; SOME ; SWAP ; UPDATE } } } } ;
                    SWAP ;
                    DROP } ;
             SWAP ;
             DROP ;
             SWAP ;
             DROP ;
             DIG 3 ;
             DROP ;
             DIG 3 ;
             DROP ;
             DUP 3 ;
             CDR ;
             DUP 4 ;
             CAR ;
             CDR ;
             DIG 2 ;
             PAIR ;
             PAIR ;
             DUG 2 ;
             DROP 2 ;
             NIL operation ;
             PAIR } ;
         SWAP ;
         APPLY ;
         LAMBDA
           (option (pair (pair address bool) (option address)))
           unit
           { IF_NONE
               { UNIT }
               { CAR ;
                 CAR ;
                 SENDER ;
                 COMPARE ;
                 NEQ ;
                 IF { PUSH string "NOT_AN_ADMIN" ; FAILWITH } { UNIT } } } ;
         DIG 3 ;
         UNPAIR ;
         IF_LEFT
           { IF_LEFT
               { DIG 3 ;
                 DROP ;
                 DIG 3 ;
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
                         IF_NONE
                           { PUSH string "NO_ADMIN_CAPABILITIES_CONFIGURED" ; FAILWITH }
                           { DUP ;
                             CDR ;
                             IF_NONE
                               { DROP ; PUSH string "NO_PENDING_ADMIN" ; FAILWITH }
                               { SENDER ;
                                 COMPARE ;
                                 EQ ;
                                 IF { NONE address ; SWAP ; CAR ; CDR ; SENDER ; PAIR ; PAIR ; SOME }
                                    { DROP ; PUSH string "NOT_A_PENDING_ADMIN" ; FAILWITH } } } ;
                         NIL operation ;
                         PAIR }
                       { SWAP ;
                         DUP ;
                         DUG 2 ;
                         DIG 4 ;
                         SWAP ;
                         EXEC ;
                         DROP ;
                         SWAP ;
                         IF_NONE
                           { DROP ; PUSH string "NO_ADMIN_CAPABILITIES_CONFIGURED" ; FAILWITH }
                           { DUP ; CDR ; DUG 2 ; CAR ; CAR ; PAIR ; PAIR ; SOME } ;
                         NIL operation ;
                         PAIR } }
                   { SWAP ;
                     DUP ;
                     DUG 2 ;
                     DIG 4 ;
                     SWAP ;
                     EXEC ;
                     DROP ;
                     SWAP ;
                     IF_NONE
                       { DROP ; PUSH string "NO_ADMIN_CAPABILITIES_CONFIGURED" ; FAILWITH }
                       { SWAP ; SOME ; SWAP ; CAR ; PAIR ; SOME } ;
                     NIL operation ;
                     PAIR } ;
                 UNPAIR ;
                 DUP 3 ;
                 CDR ;
                 DIG 3 ;
                 CAR ;
                 CDR ;
                 DIG 3 ;
                 PAIR ;
                 PAIR ;
                 SWAP ;
                 PAIR }
               { DIG 2 ;
                 DROP ;
                 SWAP ;
                 DUP ;
                 DUG 2 ;
                 CAR ;
                 CAR ;
                 IF_NONE
                   { UNIT }
                   { CAR ; CDR ; IF { PUSH string "PAUSED" ; FAILWITH } { UNIT } } ;
                 DROP ;
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
                         DUP ;
                         CAR ;
                         MAP { DUP 3 ;
                               SWAP ;
                               DUP ;
                               DUG 2 ;
                               CDR ;
                               GET ;
                               IF_NONE
                                 { DROP ; DUP 5 ; FAILWITH }
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
                         DIG 4 ;
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
                       { DIG 4 ;
                         DROP ;
                         MAP { DUP ;
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
                           { UNPAIR ;
                             UNPAIR ;
                             DIG 2 ;
                             UNPAIR ;
                             DUP 4 ;
                             DUP 4 ;
                             COMPARE ;
                             EQ ;
                             IF { DROP 4 ; UNIT }
                                { DIG 3 ;
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
                     DIG 3 ;
                     DROP ;
                     SWAP ;
                     DUP ;
                     DUG 2 ;
                     CDR ;
                     CAR ;
                     SWAP ;
                     SENDER ;
                     DUG 2 ;
                     ITER { SWAP ;
                            DUP 3 ;
                            DUP 3 ;
                            IF_LEFT {} {} ;
                            CAR ;
                            COMPARE ;
                            EQ ;
                            IF {} { PUSH string "FA2_NOT_OWNER" ; FAILWITH } ;
                            SWAP ;
                            IF_LEFT
                              { SWAP ;
                                UNIT ;
                                SOME ;
                                DUP 3 ;
                                CDR ;
                                CDR ;
                                DUP 4 ;
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
                                DUP 3 ;
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
                 UNPAIR ;
                 DUP 3 ;
                 CDR ;
                 DIG 2 ;
                 DIG 3 ;
                 CAR ;
                 CAR ;
                 PAIR ;
                 PAIR ;
                 SWAP ;
                 PAIR } }
           { DIG 4 ;
             DROP ;
             SWAP ;
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
             NIL (pair (option address) (pair nat nat)) ;
             PAIR ;
             SWAP ;
             ITER { DUP ;
                    DUG 2 ;
                    CAR ;
                    CAR ;
                    SWAP ;
                    DUP ;
                    DUG 2 ;
                    CDR ;
                    CAR ;
                    CDR ;
                    SWAP ;
                    DUP ;
                    DUG 2 ;
                    COMPARE ;
                    LT ;
                    IF { DROP 3 ; PUSH string "FA2_INVALID_TOKEN_ID" ; FAILWITH }
                       { SWAP ;
                         DUP ;
                         DUG 2 ;
                         CDR ;
                         DUP 3 ;
                         CDR ;
                         CDR ;
                         CDR ;
                         DUP 5 ;
                         CAR ;
                         DUP 4 ;
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
                         DUP 4 ;
                         ADD ;
                         DIG 2 ;
                         CAR ;
                         CAR ;
                         PAIR ;
                         PAIR ;
                         DIG 2 ;
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
             UNPAIR ;
             DUP 3 ;
             CDR ;
             DIG 2 ;
             DIG 3 ;
             CAR ;
             CAR ;
             PAIR ;
             PAIR ;
             SWAP ;
             PAIR } } }
`;

export default code;
