#!/bin/sh

echo "Starting worker in background..."
npm run dev:worker &

echo "Starting main server..."
npm run dev