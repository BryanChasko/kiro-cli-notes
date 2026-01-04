# GitHub SSO Token Setup

<!--
Attribution:
Source: Professional security practices for Kiro CLI MCP integration
Repository Maintainer: Bryan Chasko (@bryanchasko)
Guidance: Enterprise-grade token management for GitHub MCP servers
License: MIT
-->

## Step 1: Generate GitHub SSO Token

### Option A: GitHub CLI (Recommended)
```bash
# Login with SSO
gh auth login --with-token

# Generate a token with required scopes
gh auth token --scopes "repo,read:org,read:user"
```

### Option B: GitHub Web Interface
1. Go to GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Click "Generate new token"
3. Set expiration (recommend 90 days max for security)
4. Select required permissions:
   - Repository access: All repositories or specific repos
   - Repository permissions: Contents (read), Metadata (read), Pull requests (read/write)
   - Account permissions: Email addresses (read)

## Step 2: Store Token in AWS Parameter Store

```bash
# Store the token securely (replace with your actual token)
aws ssm put-parameter \
  --name "/kiro/github/sso-token" \
  --value "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  --type "SecureString" \
  --description "GitHub SSO token for Kiro MCP integration - expires YYYY-MM-DD" \
  --tags "Key=Purpose,Value=KiroMCP" "Key=Rotation,Value=Required"
```

## Step 3: Token Rotation Strategy

### Automated Rotation (Recommended)
Create a Lambda function for automatic token rotation:

```python
# lambda_function.py - GitHub token rotation
import boto3
import requests
import os
from datetime import datetime, timedelta

def lambda_handler(event, context):
    # Check token expiration (GitHub API)
    # Generate new token via GitHub App
    # Update SSM parameter
    # Send notification if rotation fails
    pass
```

### Manual Rotation Schedule
- **90-day tokens**: Rotate every 75 days
- **30-day tokens**: Rotate every 25 days
- **Set calendar reminders** 5 days before expiration

### Rotation Command
```bash
# Update existing parameter
aws ssm put-parameter \
  --name "/kiro/github/sso-token" \
  --value "new_token_here" \
  --type "SecureString" \
  --overwrite \
  --description "GitHub SSO token - rotated $(date +%Y-%m-%d)"
```

## Step 4: Security Best Practices

### IAM Permissions (Principle of Least Privilege)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/kiro/github/sso-token",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "us-east-1"
        }
      }
    }
  ]
}
```

### Monitoring & Alerts
```bash
# CloudWatch alarm for parameter access
aws cloudwatch put-metric-alarm \
  --alarm-name "kiro-github-token-access" \
  --alarm-description "Monitor GitHub token parameter access" \
  --metric-name "ParameterAccess" \
  --namespace "AWS/SSM" \
  --statistic "Sum" \
  --period 300 \
  --threshold 10 \
  --comparison-operator "GreaterThanThreshold"
```

### Token Validation
```bash
# Test token validity before storing
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# Verify parameter retrieval
aws ssm get-parameter \
  --name '/kiro/github/sso-token' \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text
```

## Step 5: Emergency Procedures

### Token Compromise
1. **Immediately revoke** token in GitHub Settings
2. **Delete** SSM parameter: `aws ssm delete-parameter --name "/kiro/github/sso-token"`
3. **Generate new token** following Step 1
4. **Update parameter** following Step 2
5. **Review access logs** in CloudTrail

### Rotation Failure
1. Check Lambda logs (if using automated rotation)
2. Verify GitHub API rate limits
3. Ensure IAM permissions are correct
4. Manual fallback rotation using Step 3 commands

## Security Checklist
- ✅ Token has minimal required scopes
- ✅ Token expiration ≤ 90 days
- ✅ Stored as SecureString in SSM
- ✅ IAM permissions follow least privilege
- ✅ CloudWatch monitoring enabled
- ✅ Rotation schedule documented
- ✅ Emergency procedures tested
