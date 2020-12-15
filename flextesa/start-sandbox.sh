#!/bin/bash

IMAGE="registry.gitlab.com/tezos/flextesa:00b415f2-run"
ENTRY="delphibox"

docker run --rm --name flextesa-sandbox   \
  -e block_time=5 --detach -p 20000:20000 \
  "${IMAGE}" "${ENTRY}" start
