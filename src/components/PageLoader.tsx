import React from "react";
import Section from "./Section";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import CircularProgress from "@material-ui/core/CircularProgress";

function PageLoader(props: any) {
  const { height = 350, children, ...otherProps } = props;

  return (
    <Section bgColor="white" {...otherProps}>
      <Container>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={height}
        >
          {!props.children && <CircularProgress size={32} />}

          {props.children && <>{props.children}</>}
        </Box>
      </Container>
    </Section>
  );
}

export default PageLoader;
