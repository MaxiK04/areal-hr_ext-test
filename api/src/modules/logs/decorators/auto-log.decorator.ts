import { LogsService } from '../logs.service';

export interface LogOptions {
    operation: string;
    entity?: string;
    idField?: string;
    nameFields?: string[];
    extractUserIdFrom?: 'first' | 'last' | 'arg' | 'request';
}

export function AutoLog(options: LogOptions) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const logsService: LogsService = this.logsService;
            if (!logsService) {
                console.warn('LogsService not found, skipping logging');
                return originalMethod.apply(this, args);
            }


            let userId = 0;
            const req = args.find(arg => arg && typeof arg === 'object' && 'user' in arg);
            if (req && req.user && req.user.id) {
                userId = req.user.id;
            }

            try {

                const result = await originalMethod.apply(this, args);

                if (result) {
                    let entityDescription = options.entity || 'объект';

                    if (options.nameFields && result) {
                        const nameParts = options.nameFields
                            .map(field => result[field])
                            .filter(Boolean);
                        if (nameParts.length > 0) {
                            entityDescription = nameParts.join(' ');
                        }
                    }
                    const entityId = result[options.idField || 'id'] || result.id;

                    const messages = {
                        create: `Создан ${entityDescription}`,
                        update: `Обновлен ${entityDescription}`,
                        delete: `Удален ${entityDescription}`,
                        hire: `Нанят сотрудник ${entityDescription}`,
                        dismiss: `Уволен сотрудник ${entityDescription}`,
                        transfer: `Переведен сотрудник ${entityDescription}`
                    };

                    const message = messages[options.operation] ||
                        `Выполнена операция "${options.operation}" для ${entityDescription}`;
                    await logsService.log(
                        userId,
                        options.operation,
                        entityId ? `${message} (ID: ${entityId})` : message
                    );
                }

                return result;
            } catch (error) {

                await logsService.log(
                    userId,
                    'error',
                    `Ошибка при ${options.operation}: ${error.message}`
                );
                throw error;
            }
        };

        return descriptor;
    };
}