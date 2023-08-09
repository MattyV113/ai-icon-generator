export function FormGroup(props: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div {...props} className="flex flex-col">
      {props.children}
    </div>
  );
}
