// frontend/src/components/policies/PolicyEditor.tsx

import React from 'react';
import {
    Box, TextField, Button as MuiButton, Switch, FormControlLabel,
    Typography, Grid, Paper, IconButton, Autocomplete, FormHelperText, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Policy, PolicyCondition, PolicyAction } from '../../types';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface PolicyEditorProps {
    initialPolicy?: Policy | null;
    onSubmit: (policyData: Omit<Policy, '_id' | 'createdAt' | 'updatedAt' | 'version' | 'createdBy' | 'updatedBy'> | Policy) => void;
    onCancel: () => void;
    isSubmitting?: boolean; 
}

const conditionSchema = Yup.object().shape({
    field: Yup.string().required('Field is required'),
    operator: Yup.string().required('Operator is required'),
    value: Yup.mixed().when('operator', { 
        is: (op: string) => op && !['is_empty', 'is_not_empty'].includes(op),
        then: (schema) => schema.required('Value is required'),
        otherwise: (schema) => schema.optional(),
    }),
    dataType: Yup.string().optional(),
});

const actionSchema = Yup.object().shape({
    type: Yup.string().required('Action type is required'),
    parameters: Yup.object().optional(),
});

const policySchema = Yup.object().shape({
    name: Yup.string().required('Policy name is required'),
    description: Yup.string().optional(),
    isEnabled: Yup.boolean(),
    conditions: Yup.array().of(conditionSchema).min(1, 'At least one condition is required'),
    actions: Yup.array().of(actionSchema).min(1, 'At least one action is required'),
});

const availableConditionFields = [
    { value: 'content.text', label: 'Content Text', type: 'string' },
    { value: 'file.name', label: 'File Name', type: 'string' },
    { value: 'file.type', label: 'File Type (MIME)', type: 'string' },
    { value: 'network.destination_ip', label: 'Destination IP', type: 'string' },
    { value: 'user.id', label: 'User ID', type: 'string' },
    { value: 'user.group', label: 'User Group', type: 'string' },
];

const availableOperators: Record<string, { value: string, label: string }[]> = {
    string: [
        { value: 'contains', label: 'Contains' },
        { value: 'not_contains', label: 'Does Not Contain' },
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Does Not Equal' },
        { value: 'starts_with', label: 'Starts With' },
        { value: 'ends_with', label: 'Ends With' },
        { value: 'matches_regex', label: 'Matches Regex' },
        { value: 'is_one_of', label: 'Is One Of (comma-separated)' },
    ],
    number: [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Does Not Equal' },
        { value: 'greater_than', label: 'Greater Than' },
        { value: 'less_than', label: 'Less Than' },
    ],
};

const availableActionTypes = [
    { value: 'alert', label: 'Create Alert' },
    { value: 'block', label: 'Block Action' },
    { value: 'log', label: 'Log Event' },
    { value: 'notify_user', label: 'Notify User' },
];


const PolicyEditor: React.FC<PolicyEditorProps> = ({ initialPolicy, onSubmit, onCancel, isSubmitting: externalSubmitting }) => {
    const formik = useFormik<Omit<Policy, '_id' | 'createdAt' | 'updatedAt' | 'version' | 'createdBy' | 'updatedBy'>>({
        initialValues: {
            name: initialPolicy?.name || '',
            description: initialPolicy?.description || '',
            isEnabled: initialPolicy?.isEnabled !== undefined ? initialPolicy.isEnabled : true,
            conditions: initialPolicy?.conditions || [{ field: '', operator: 'contains', value: '', dataType: 'string' }],
            actions: initialPolicy?.actions || [{ type: 'alert', parameters: { severity: 'Medium' } }],
            tags: initialPolicy?.tags || [],
            scope: initialPolicy?.scope || { users: [], userGroups: [] },
        },
        validationSchema: policySchema,
        onSubmit: (values) => {
            const policyDataToSubmit = { ...values };
            if (initialPolicy?._id) {
                (policyDataToSubmit as Policy)._id = initialPolicy._id; 
            }
            onSubmit(policyDataToSubmit as Policy);
        },
        enableReinitialize: true, 
    });

    const { values, handleChange, handleBlur, handleSubmit, errors, touched, setFieldValue, isSubmitting } = formik;

    return (
        <FormikProvider value={formik}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField name="name" label="Policy Name" value={values.name} onChange={handleChange} onBlur={handleBlur} error={touched.name && Boolean(errors.name)} helperText={touched.name && errors.name as string} fullWidth className="bg-dlp-surface" InputLabelProps={{className: "text-dlp-text-secondary"}} InputProps={{className: "text-dlp-text-primary"}}/>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControlLabel control={<Switch name="isEnabled" checked={values.isEnabled} onChange={handleChange} />} label="Enable Policy" className="text-dlp-text-secondary"/>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField name="description" label="Description" value={values.description} onChange={handleChange} onBlur={handleBlur} multiline rows={3} fullWidth className="bg-dlp-surface" InputLabelProps={{className: "text-dlp-text-secondary"}} InputProps={{className: "text-dlp-text-primary"}}/>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom className="text-dlp-text-primary">Conditions</Typography>
                        <FieldArray name="conditions">
                            {({ push, remove }) => (
                                <Box>
                                    {values.conditions.map((condition, index) => (
                                        <Paper key={index} elevation={0} sx={{ p: 2, mb: 2, position: 'relative' }} className="bg-dlp-surface/50 border border-dlp-surface">
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={12} sm={3}>
                                                    <Autocomplete
                                                        options={availableConditionFields}
                                                        getOptionLabel={(option) => option.label}
                                                        value={availableConditionFields.find(f => f.value === condition.field) || null}
                                                        onChange={(e, newValue) => {
                                                            setFieldValue(`conditions.${index}.field`, newValue?.value || '');
                                                            setFieldValue(`conditions.${index}.dataType`, newValue?.type || 'string');
                                                            setFieldValue(`conditions.${index}.operator`, ''); 
                                                        }}
                                                        renderInput={(params) => (
                                                            <TextField {...params} label="Field" error={touched.conditions?.[index]?.field && Boolean(errors.conditions?.[index]?.field)} helperText={touched.conditions?.[index]?.field && errors.conditions?.[index]?.field as string} InputLabelProps={{className: "text-dlp-text-secondary"}} InputProps={{...params.InputProps, className: "text-dlp-text-primary"}}/>
                                                        )}
                                                        className="bg-dlp-surface"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={3}>
                                                    <FormControl fullWidth error={touched.conditions?.[index]?.operator && Boolean(errors.conditions?.[index]?.operator)} className="bg-dlp-surface">
                                                        <InputLabel className="text-dlp-text-secondary">Operator</InputLabel>
                                                        <Select
                                                            name={`conditions.${index}.operator`}
                                                            value={condition.operator}
                                                            label="Operator"
                                                            onChange={handleChange}
                                                            disabled={!condition.field}
                                                            className="text-dlp-text-primary"
                                                            MenuProps={{ PaperProps: { className: "bg-dlp-surface text-dlp-text-primary"}}}
                                                        >
                                                            {(availableOperators[condition.dataType || 'string'] || []).map(op => (
                                                                <MenuItem key={op.value} value={op.value} className="hover:bg-dlp-accent/20">{op.label}</MenuItem>
                                                            ))}
                                                        </Select>
                                                         {touched.conditions?.[index]?.operator && errors.conditions?.[index]?.operator && <FormHelperText className="text-red-400">{errors.conditions?.[index]?.operator as string}</FormHelperText>}
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} sm={5}>
                                                    <TextField name={`conditions.${index}.value`} label="Value" value={condition.value as string} onChange={handleChange} onBlur={handleBlur} fullWidth error={touched.conditions?.[index]?.value && Boolean(errors.conditions?.[index]?.value)} helperText={touched.conditions?.[index]?.value && errors.conditions?.[index]?.value as string} className="bg-dlp-surface" InputLabelProps={{className: "text-dlp-text-secondary"}} InputProps={{className: "text-dlp-text-primary"}}/>
                                                </Grid>
                                                <Grid item xs={12} sm={1}>
                                                    <IconButton onClick={() => remove(index)} color="error" sx={{ mt:1 }} disabled={values.conditions.length <= 1}>
                                                        <DeleteOutlineIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    ))}
                                    <MuiButton startIcon={<AddCircleOutlineIcon />} onClick={() => push({ field: '', operator: 'contains', value: '', dataType: 'string' })} className="text-dlp-accent">
                                        Add Condition
                                    </MuiButton>
                                     {typeof errors.conditions === 'string' && <FormHelperText error className="text-red-400">{errors.conditions}</FormHelperText>}
                                </Box>
                            )}
                        </FieldArray>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom className="text-dlp-text-primary">Actions</Typography>
                        <FieldArray name="actions">
                            {({ push, remove }) => (
                                <Box>
                                    {values.actions.map((action, index) => (
                                        <Paper key={index} elevation={0} sx={{ p: 2, mb: 2, position: 'relative' }} className="bg-dlp-surface/50 border border-dlp-surface">
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={10} sm={5}>
                                                     <FormControl fullWidth error={touched.actions?.[index]?.type && Boolean(errors.actions?.[index]?.type)} className="bg-dlp-surface">
                                                        <InputLabel className="text-dlp-text-secondary">Action Type</InputLabel>
                                                        <Select
                                                            name={`actions.${index}.type`}
                                                            value={action.type}
                                                            label="Action Type"
                                                            onChange={handleChange}
                                                            className="text-dlp-text-primary"
                                                            MenuProps={{ PaperProps: { className: "bg-dlp-surface text-dlp-text-primary"}}}
                                                        >
                                                            {availableActionTypes.map(at => (
                                                                <MenuItem key={at.value} value={at.value} className="hover:bg-dlp-accent/20">{at.label}</MenuItem>
                                                            ))}
                                                        </Select>
                                                        {touched.actions?.[index]?.type && errors.actions?.[index]?.type && <FormHelperText className="text-red-400">{errors.actions?.[index]?.type as string}</FormHelperText>}
                                                    </FormControl>
                                                </Grid>
                                                {action.type === 'alert' && (
                                                    <Grid item xs={12} sm={6}>
                                                        <FormControl fullWidth size="small" className="bg-dlp-surface">
                                                            <InputLabel className="text-dlp-text-secondary">Severity</InputLabel>
                                                            <Select
                                                                name={`actions.${index}.parameters.severity`}
                                                                value={(action.parameters as {severity: string})?.severity || 'Medium'}
                                                                label="Severity"
                                                                onChange={handleChange}
                                                                className="text-dlp-text-primary"
                                                                MenuProps={{ PaperProps: { className: "bg-dlp-surface text-dlp-text-primary"}}}
                                                            >
                                                                <MenuItem value="Low" className="hover:bg-dlp-accent/20">Low</MenuItem>
                                                                <MenuItem value="Medium" className="hover:bg-dlp-accent/20">Medium</MenuItem>
                                                                <MenuItem value="High" className="hover:bg-dlp-accent/20">High</MenuItem>
                                                                <MenuItem value="Critical" className="hover:bg-dlp-accent/20">Critical</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                )}
                                                <Grid item xs={2} sm={1}>
                                                    <IconButton onClick={() => remove(index)} color="error" sx={{ mt:0.5 }} disabled={values.actions.length <= 1}>
                                                        <DeleteOutlineIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    ))}
                                    <MuiButton startIcon={<AddCircleOutlineIcon />} onClick={() => push({ type: 'alert', parameters: { severity: 'Medium' } })} className="text-dlp-accent">
                                        Add Action
                                    </MuiButton>
                                    {typeof errors.actions === 'string' && <FormHelperText error className="text-red-400">{errors.actions}</FormHelperText>}
                                </Box>
                            )}
                        </FieldArray>
                    </Grid>

                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                    <MuiButton onClick={onCancel} sx={{ mr: 2 }} disabled={isSubmitting || externalSubmitting} className="text-dlp-text-secondary">Cancel</MuiButton>
                    <MuiButton type="submit" variant="contained" disabled={isSubmitting || externalSubmitting} className="bg-primary hover:bg-primary-dark text-white">
                        {isSubmitting || externalSubmitting ? 'Saving...' : (initialPolicy?._id ? 'Save Changes' : 'Create Policy')}
                    </MuiButton>
                </Box>
            </form>
        </FormikProvider>
    );
};

export default PolicyEditor;
