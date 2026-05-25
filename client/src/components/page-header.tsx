type Props = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export const PageHeader = ({ title, description, action }: Props) => {
  return (
    <div className="mb-8 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
