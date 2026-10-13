import type { ReactNode } from 'react';

type PageHeaderProps = {
    title: string;
    subtitle: string;
    action?: ReactNode;
    action2?: ReactNode;
};

function PageHeader({
    title,
    subtitle,
    action,
    action2
}: PageHeaderProps) {
    return (
        <>
            <div className="mb-8 flex flex-col gap-5 border-b border-[var(--border)] pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">Trading journal</p>
                    <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-4xl">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="mt-2 max-w-xl text-sm text-[var(--text2)]">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {action2 && (
                        <div className="journal-header-action journal-header-action-secondary">
                            {action2}
                        </div>
                    )}
                    {action && (
                        <div className="journal-header-action journal-header-action-primary">
                            {action}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default PageHeader
