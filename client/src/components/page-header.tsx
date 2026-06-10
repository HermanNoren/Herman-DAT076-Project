type Props = {
  /** Page heading. */
  title: string;
  /** Subtitle rendered under the heading. */
  description: string;
  /** Optional element rendered to the right, e.g. an admin-only create button. */
  action?: React.ReactNode;
};

/** Heading block used at the top of every page, with an optional action slot. */
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
