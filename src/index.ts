import { handler as MigrationHandler } from './migration-lambda';
import { handler as PostConfirmationHandler } from './post-confirmation-lambda';
import { handler as PreSignupHandler } from './pre-signup-lambda';

export { MigrationHandler, PostConfirmationHandler, PreSignupHandler };
