import { getRequestConfig } from 'next-intl/server';
import { locales } from './i18n';

export default getRequestConfig(async ({ locale }) => {
	// Validate that the incoming `locale` parameter is valid
	if (!locales.includes(locale as typeof locales[number])) {
		// Handle invalid locale - could redirect or show error
		return { messages: {} };
	}

	return {
		messages: (await import(`./messages/${locale}.json`)).default
	};
});
