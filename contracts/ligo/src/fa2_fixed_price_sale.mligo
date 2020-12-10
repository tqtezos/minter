#include "fa2_fixed_priec_sale_contract.mligo"

// Fixed-price sale
// The asset is transferred to a sale contract
// An execution price is specified by the seller
// The execution price is met by a buyer (who signs the transaction)
// The transfer and transaction are executed once a buyer submits a valid transaction
// Note: there is no date specified - the seller would need to end the sale, i.e. “flush”



// sale_contracts : (sale_contract_id, sale_contract_params) big_map;

type fixed_sale_main (param, storage : fixed_sale_entrypoints * fixed_sale_storage) : operation list * fixed_sale_storage =
  ([] : operation list, storage)