#!/bin/sh

# Reset tmux
tmux kill-server

tmux start-server


S="developmentSession"

W1="API"
tmux new-session -d -s $S -n $W1
tmux send-keys -t "$S:$W1" "python run.py" C-m

W2="client"
tmux new-window -d -t $S -n $W2
tmux send-keys -t "$S:$W2" "cd $PWD/app/client" C-m
tmux send-keys -t "$S:$W2" "npm run dev" C-m

tmux select-window -t $S:$W1
tmux attach-session -t $S