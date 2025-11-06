/**
 * Email Module Export
 * Re-exports resend instance for use in services
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

