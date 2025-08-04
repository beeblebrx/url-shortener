#!/bin/sh
docker compose up -d db pgadmin # Don't start app container now
./tmux.sh