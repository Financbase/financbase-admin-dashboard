/**
 * Custom ESLint rule to enforce ApiErrorHandler usage in API routes
 * 
 * This rule warns when API route files contain manual error responses
 * instead of using the centralized ApiErrorHandler.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce ApiErrorHandler usage in API routes',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      useApiErrorHandler: 'API route should use ApiErrorHandler instead of manual error responses. Found: {{pattern}}',
      missingApiErrorHandler: 'API route should import and use ApiErrorHandler for error handling',
    },
  },
  create(context) {
    const filename = context.getFilename();
    
    // Only check API route files
    if (!filename.includes('/app/api/') || !filename.endsWith('/route.ts')) {
      return {};
    }

    let hasApiErrorHandlerImport = false;
    let hasManualErrorResponse = false;
    const manualErrorPatterns = [];

    return {
      // Check for ApiErrorHandler import
      ImportDeclaration(node) {
        if (
          node.source.value === '@/lib/api-error-handler' ||
          node.source.value === '../../lib/api-error-handler' ||
          node.source.value.includes('api-error-handler')
        ) {
          hasApiErrorHandlerImport = true;
        }
      },

      // Check for manual error responses
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object?.name === 'NextResponse' &&
          node.callee.property?.name === 'json'
        ) {
          // Check if it's an error response with status code
          const args = node.arguments;
          if (args.length >= 2) {
            const secondArg = args[1];
            if (
              secondArg.type === 'ObjectExpression' &&
              secondArg.properties.some(
                (prop) =>
                  prop.key?.name === 'status' &&
                  (prop.value?.value >= 400 || prop.value?.value < 600)
              )
            ) {
              hasManualErrorResponse = true;
              const statusProp = secondArg.properties.find(
                (prop) => prop.key?.name === 'status'
              );
              if (statusProp) {
                manualErrorPatterns.push(`NextResponse.json with status ${statusProp.value?.value}`);
              }
            }
          }
        }
      },

      // Check for manual error responses in return statements
      ReturnStatement(node) {
        if (node.argument?.type === 'CallExpression') {
          const callExpr = node.argument;
          if (
            callExpr.callee.type === 'MemberExpression' &&
            callExpr.callee.object?.name === 'NextResponse' &&
            callExpr.callee.property?.name === 'json'
          ) {
            const args = callExpr.arguments;
            if (args.length >= 2) {
              const secondArg = args[1];
              if (
                secondArg.type === 'ObjectExpression' &&
                secondArg.properties.some(
                  (prop) =>
                    prop.key?.name === 'status' &&
                    (prop.value?.value >= 400 || prop.value?.value < 600)
                )
              ) {
                hasManualErrorResponse = true;
                const statusProp = secondArg.properties.find(
                  (prop) => prop.key?.name === 'status'
                );
                if (statusProp) {
                  manualErrorPatterns.push(`NextResponse.json with status ${statusProp.value?.value}`);
                }
              }
            }
          }
        }
      },

      // Report at the end of the file
      'Program:exit'(node) {
        if (hasManualErrorResponse && !hasApiErrorHandlerImport) {
          context.report({
            node,
            messageId: 'missingApiErrorHandler',
          });
        } else if (hasManualErrorResponse && hasApiErrorHandlerImport) {
          // Has import but still using manual responses
          const uniquePatterns = [...new Set(manualErrorPatterns)];
          context.report({
            node,
            messageId: 'useApiErrorHandler',
            data: {
              pattern: uniquePatterns.join(', '),
            },
          });
        }
      },
    };
  },
};

