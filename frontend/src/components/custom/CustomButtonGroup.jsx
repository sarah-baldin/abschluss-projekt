const CustomButtonGroup = ({ spacing, alignment, children, ...restProps }) => {
  const styles = {
    display: "flex",
    gap: spacing || "10px",
    justifyContent: alignment || "flex-end",
  };

  return (
    <div style={styles} {...restProps}>
      {children}
    </div>
  );
};

export default CustomButtonGroup;
