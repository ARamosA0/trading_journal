function PageHeader({
    title,
    subtitle,
    action,
    action2
}) {
    return (
        <>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text)]">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="text-[var(--text2)]">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="flex flex-row">
                    {action2 && (
                        <div className="border border[var(--border)] px-4 py-2 rounded-lg">
                            {action2}
                        </div>
                    )}
                    {action && (
                        <div className="px-4 py-2 rounded-lg"
                            style={{ background: 'var(--gradient)' }}
                        >
                            {action}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default PageHeader