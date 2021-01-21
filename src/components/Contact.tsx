import React, { useState } from "react";
import Box from "@material-ui/core/Box";
import Alert from "@material-ui/lab/Alert";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import contact from "./../util/contact";
import { useForm } from "react-hook-form";

function Contact(props: any) {
  const [pending, setPending]: any[] = useState(false);
  const [formAlert, setFormAlert]: any[] = useState(null);
  const { handleSubmit, register, errors, reset } = useForm();

  const onSubmit = (data: any) => {
    // Show pending indicator
    setPending(true);

    contact
      .submit(data)
      .then(() => {
        // Clear form
        reset();
        // Show success alert message
        setFormAlert({
          type: "success",
          message: "Your message has been sent!",
        });
      })
      .catch((error) => {
        // Show error alert message
        setFormAlert({
          type: "error",
          message: error.message,
        });
      })
      .finally(() => {
        // Hide pending indicator
        setPending(false);
      });
  };

  return (
    <>
      {formAlert && (
        <Box mb={3}>
          <Alert severity={formAlert.type}>{formAlert.message}</Alert>
        </Box>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container={true} spacing={2}>
          {props.showNameField && (
            <Grid item={true} xs={12} md={6}>
              <TextField
                variant="outlined"
                type="text"
                label="Name"
                name="name"
                error={errors.name ? true : false}
                // @ts-ignore
                helperText={errors.name && errors.name.message}
                fullWidth={true}
                inputRef={register({
                  required: "Please enter your name",
                })}
              />
            </Grid>
          )}

          <Grid item={true} xs={12} md={props.showNameField ? 6 : 12}>
            <TextField
              variant="outlined"
              type="email"
              label="Email"
              name="email"
              error={errors.email ? true : false}
              // @ts-ignore
              helperText={errors.email && errors.email.message}
              fullWidth={true}
              inputRef={register({
                required: "Please enter your email",
              })}
            />
          </Grid>
          <Grid item={true} xs={12}>
            <TextField
              variant="outlined"
              type="text"
              label="Message"
              name="message"
              multiline={true}
              rows={5}
              error={errors.message ? true : false}
              // @ts-ignore
              helperText={errors.message && errors.message.message}
              fullWidth={true}
              inputRef={register({
                required: "Please enter a message",
              })}
            />
          </Grid>
          <Grid item={true} xs={12}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              disabled={pending}
            >
              {!pending && <span>{props.buttonText}</span>}

              {pending && <CircularProgress size={28} />}
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}

export default Contact;
