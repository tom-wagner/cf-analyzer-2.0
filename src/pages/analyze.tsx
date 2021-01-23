import _ from "lodash";
import React from "react";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { AppBar, Box, Input, InputAdornment, makeStyles, Tab, Tabs, TextField, Theme, Tooltip, Typography, useTheme } from "@material-ui/core";
import { Help } from "@material-ui/icons";
import classes from "*.module.css";

type FormField = {
  id: string,
  label: string,
  inputType: string,
  gridWidth: number,
  defaultValue?: number,
  required?: boolean,
  startAdornment?: string,
  endAdornment?: string,
  helperText?: string[],
};

type TabType = {
  tabTitle: string,
  formFields: FormField[],
}

function Paragraphs(props: { paragraphs: string[] }) {
  return (
    <>
      {_.map(props.paragraphs, p => (
        // TODO: Consider using standard MUI styling
        <p style={{ fontSize: '0.8rem' }}>
          {p}
        </p>
      ))}
    </>
  );
}

const TABS: TabType[] = [
  // TODO: Consider allowing users to populate certain fields this from saved settings
  {
    tabTitle: 'Purchase Details',
    formFields: [
      // TODO: Integrate with Google Maps API
      // TODO: Add Validator Functions
      {
        id: 'property_address',
        label: 'Property Address',
        inputType: 'text',
        gridWidth: 6,
        required: true,
        startAdornment: '🏠',
      },
      {
        id: 'purchase_price',
        label: 'Purchase Price',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        startAdornment: '$',
      },
      {
        id: 'closing_costs',
        label: 'Closing Costs',
        inputType: 'number',
        gridWidth: 3,
        startAdornment: '$',
      },
    ],
  },
  {
    tabTitle: 'Loan Details',
    formFields: [
      {
        id: 'loan_type',
        label: 'Loan Type',
        inputType: 'text',
        gridWidth: 3,
        required: true,
      },
      {
        id: 'term',
        label: 'Loan Term',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: 30,
        endAdornment: 'Years',
      },
      {
        id: 'percentage_down',
        label: 'Down Payment Percentage',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: 20,
        endAdornment: '%',
      },
      {
        id: 'interest_rate',
        label: 'Interest Rate',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: 0.0275,
        endAdornment: '%',
      },
    ],
  },
  {
    tabTitle: 'Fixed Income and Expenses',
    formFields: [
      {
        id: 'monthly_rent',
        label: 'Monthly Rent',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        startAdornment: '$',
      },
      {
        id: 'tax_rate',
        label: 'Tax Rate',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: 0.50,
        endAdornment: '%',
      },
      {
        id: 'monthly_insurance',
        label: 'Monthly Insurance Cost',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: 200,
        endAdornment: '$',
      },
    ],
  },
  {
    tabTitle: 'Variable Expenses',
    formFields: [
      {
        id: 'capex_rate',
        label: 'Capital Expenditures (Capex) Rate',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: 5,
        endAdornment: '%',
        helperText: [
          `Capital Expenditures Rate is calculated as the annual cost of major expenditures
          (ex: replacing the roof, a new water heater, etc.) divided by the gross annual rental
          income. It will vary greatly from property to property depending on age, location, cost
          and other factors.`,
          `Generally, setting aside 5-10% of rental income for CapEx is a good rule of thumb.`,
        ],
      },
      {
        id: 'repairs_rate',
        label: 'Repairs & Maintenance Rate',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: 5,
        endAdornment: '%',
        helperText: [
          `Repairs & Maintenance Rate is calculated as the annual cost of property repairs
          (ex: a broken window, fixing the dishwasher, etc.) divided by the gross annual rental
          income.`,
          `Generally, setting aside 5-10% of rental income for repairs is a good
          rule of thumb.`
        ],
      },
      {
        id: 'vacancy_rate',
        label: 'Vacancy Rate',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: 5,
        endAdornment: '%',
        helperText: [`
          Vacancy Rate is calculated as the percentage of time your property sits empty due
          to tentant turnover. This figure will vary depending on the property's location and
          condition, so talk to a local agent or investor to gain a better understanding of
          expected vacancy.`,
          `Typical vacancy rates range from 3-10%.`
        ],
      },
      {
        id: 'property_management_rate',
        label: 'Property Management Rate',
        inputType: 'number',
        gridWidth: 3,
        required: true,
        defaultValue: 12,
        endAdornment: '%',
        helperText: [
          `Property Management Rate is expressed as a percentage of total rental income and
          represents the amount charged by the property manager to manage your property.`,
          `Typical property management fees range from 9-12% depending on the market and
          services provided.`,
          `Leave this field blank if you plan on managing your property yourself.`
        ],
      },
    ],
  },
  {
    tabTitle: 'Growth Assumptions',
    formFields: [
      {
        id: 'appreciation_rate',
        label: 'Annual Appreciation Rate',
        inputType: 'text',
        gridWidth: 3,
        required: true,
        defaultValue: 2,
        endAdornment: '%',
      },
      {
        id: 'rent_growth',
        label: 'Annual Rent Growth',
        inputType: 'text',
        gridWidth: 3,
        required: true,
        defaultValue: 2,
        endAdornment: '%',
      },
      {
        id: 'expense_growth',
        label: 'Annual Expense Growth',
        inputType: 'text',
        gridWidth: 3,
        required: true,
        defaultValue: 2,
        endAdornment: '%',
      },
      {
        id: 'selling_expense_rate',
        label: 'Selling Expense Rate',
        inputType: 'text',
        gridWidth: 3,
        required: true,
        defaultValue: 8,
        endAdornment: '%',
      },
    ],
  },
];

function a11yProps(index: any) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    marginTop: '12px',
  },
  // https://stackoverflow.com/questions/55952086/writing-css-in-js-code-to-remove-arrow-buttons-from-textfield
  number: {
    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
      "-webkit-appearance": "none",
      margin: 0
    }
  },
  input: {
    "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
      "-webkit-appearance": "none",
      margin: 0
    }
  },
  helpIcon: {
    // TODO: Figure out what color is best here
    color: "grey",
  },
  tabPanel: {
    minWidth: 125,
    width: 125,
    lineHeight: 1.4,
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    // TODO: Improve styling here
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

type FormGridProps = {
  fields: FormField[],
};

function FormGrid(props: FormGridProps) {
  const classes = useStyles();
  return (
    <Grid container spacing={2}>
      {_.map(props.fields, (field: FormField) => (
        // @ts-ignore
        <Grid item xs={field.gridWidth}>
          <TextField
            id={field.id}
            label={field.label}
            type={field.inputType}
            required={field.required}
            fullWidth // TODO: Consider styling options
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                field.startAdornment
                  ? <InputAdornment position="start">{field.startAdornment}</InputAdornment>
                  : null
              ),
              endAdornment: (
                field.endAdornment
                  ? (
                    <InputAdornment position="start">
                      {field.endAdornment}
                      {field.helperText && (
                        <Tooltip title={<Paragraphs paragraphs={field.helperText}/>}>
                          <Help fontSize="small" style={{ marginLeft: '5px' }} className={classes.helpIcon} />
                        </Tooltip>
                      )}
                    </InputAdornment>
                  )
                  : null
              )
            }}
            className={classes.number}
            variant="outlined"
            size="small"
          />
        </Grid>
      ))}
      {/* TODO: Consider adding button to go to next tab here */}
    </Grid>
  );
}

type NewGenericTabsProps = {
  tabs: TabType[],
}

function GenericTabs(props: NewGenericTabsProps) {
  const classes = useStyles();
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => setValue(newValue);

  return (
    <div>
      <AppBar position="static" color="default">
        {/* TODO: Consider stepper instead of tabs */}
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="secondary"
          textColor="secondary"
        >
          {props.tabs.map((tab: TabType, idx) => (
            <Tab label={tab.tabTitle} {...a11yProps(idx)} className={classes.tabPanel} />
          ))}
        </Tabs>
      </AppBar>
      {props.tabs.map((tab: TabType, idx) => (
        <TabPanel value={value} index={idx} dir={theme.direction}>
          <FormGrid fields={tab.formFields} />
        </TabPanel>
      ))}
    </div>
  );
}

// TODO: pass TABS into this component in case it becomes API call later
function AnalyzePage(props: any) {
  const classes = useStyles();
  return (
    // TODO: Utilize MUI theming / spacing
    <Container className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {/* TODO: Consider adding button allowing users to hide inputs */}
          <GenericTabs tabs={TABS} />
        </Grid>
      </Grid>
    </Container>
  );
}

export default AnalyzePage;
