#!/bin/bash
docker build -t express-gateway .
docker tag express-gateway:latest 757434564846.dkr.ecr.us-east-1.amazonaws.com/express-gateway:latest
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 757434564846.dkr.ecr.us-east-1.amazonaws.com
docker push 757434564846.dkr.ecr.us-east-1.amazonaws.com/express-gateway:latest
aws ecs update-service --cluster express-gateway-cluster --service express-gateway-service --force-new-deployment --region us-east-1
