#!/bin/bash

docker run --rm --name flextesa-sandbox -e block_time=5 --detach -p 20000:20000 registry.gitlab.com/tezos/flextesa:image-tutobox-run carthagebox start
