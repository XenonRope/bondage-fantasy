export function NameWithId(props: { name: string; id: number }) {
  return (
    <div>
      <span className="font-medium">{props.name}</span>
      <span className="text-sm text-dimmed mx-1">|</span>
      <span className="text-sm text-dimmed">{props.id}</span>
    </div>
  );
}
