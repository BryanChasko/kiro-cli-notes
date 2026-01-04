# GitHub Copilot Instructions

## Project Context
This repository provides professional Kiro CLI setup configurations based on analysis of 10 official Kiro tutorial videos. The setup follows enterprise-grade security practices and cost optimization strategies.

## Code Style Guidelines
- Use clear, descriptive variable names
- Include comprehensive comments for configuration files
- Follow JSON formatting standards for config files
- Use bash best practices for shell scripts
- Include error handling and validation

## Security Requirements
- Never include actual tokens, passwords, or credentials in code
- Use AWS Parameter Store references for sensitive data
- Include security best practices in documentation
- Validate all user inputs in scripts

## Documentation Standards
- Include attribution for all content sources
- Provide step-by-step setup instructions
- Include troubleshooting sections
- Add security checklists for sensitive operations

## File Organization
- Keep configurations in `/configs` directory
- Store documentation in `/docs` directory
- Use descriptive filenames
- Include README files for each major section

## MCP Server Guidelines
- Use official MCP server implementations when available
- Include proper error handling for server connections
- Document required environment variables
- Provide health check commands

## Testing Recommendations
- Include verification steps for each configuration
- Provide test commands for MCP server connectivity
- Include rollback procedures for failed setups
- Test with minimal permissions first
