type user = {
  alias: string;
  owner: address;
}

type parameters = {}

type auction = {}

type bidder = {}

type auction_params = {}

let make_factory_operator : user -> operation = failwith "stub"


let request_new_auction : (user * parameters) -> operation = failwith "stub"

let originate_new_auction : auction big_map -> auction option = failwith "stub"

let begin_auction : (auction_params * auction * tez) -> operation = failwith "stub"


let make_bid : (bidder * auction * tez) -> operation option = failwith "stub"

let make_final_bid : (bidder * auction * tez) -> operation = failwith "stub"