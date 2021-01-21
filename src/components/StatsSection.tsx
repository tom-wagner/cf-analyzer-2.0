import React from "react";
import Section from "./Section";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

function StatsSection(props: any) {
  const items = [
    {
      title: "Properties Analyzed",
      stat: "3,456",
    },
    {
      title: "Users",
      stat: "123",
    },
    {
      title: "Median Cap Rate",
      stat: "456k",
    },
    {
      title: "Median Year 30 Cash Flow",
      stat: "789",
    },
  ];

  return (
    <Section
      bgColor={props.bgColor}
      size={props.size}
      bgImage={props.bgImage}
      bgImageOpacity={props.bgImageOpacity}
    >
      <Container>
        <Grid container={true} justify="center" spacing={4}>
          {Object.keys(items).map((index) => {
            // @ts-ignore
            const item = items[index];
            return (
              <Grid item={true} xs={12} sm={3} key={index}>
                <Box textAlign="center">
                  <Typography variant="overline">{item.title}</Typography>
                  <Typography variant="h4">{item.stat}</Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Section>
  );
}

export default StatsSection;
