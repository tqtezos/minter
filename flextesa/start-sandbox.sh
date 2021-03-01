#!/bin/bash

IMAGE="registry.gitlab.com/tezos/flextesa:56f651af-run"
ENTRY="edobox"

docker run --rm --name flextesa-sandbox   \
  -e block_time=5 --detach -p 20000:20000 \
  "${IMAGE}" "${ENTRY}" start
