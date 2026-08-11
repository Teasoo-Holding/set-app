import { makeStyles, mergeClasses, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  mark: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: tokens.colorNeutralForegroundOnBrand,
    backgroundColor: tokens.colorBrandBackground,
    borderRadius: tokens.borderRadiusMedium,
    fontWeight: tokens.fontWeightSemibold,
    userSelect: "none",
  },
  sm: { width: "24px", height: "24px", fontSize: tokens.fontSizeBase200 },
  md: { width: "32px", height: "32px", fontSize: tokens.fontSizeBase300 },
  lg: { width: "40px", height: "40px", fontSize: tokens.fontSizeBase400 },
});

/** The blue "S" brand mark from the approved demo. */
export function BrandMark({
  size = "md",
  label = "S",
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const styles = useStyles();
  return (
    <span
      className={mergeClasses(styles.mark, styles[size])}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}
