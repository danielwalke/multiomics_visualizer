import React from "react";
import TreeItem from "@material-ui/lab/TreeItem"
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import * as PropTypes from "prop-types";
import {Link} from "react-router-dom";

const useTreeItemStyles = makeStyles((theme) => ({
    root: {
        color: theme.palette.text.secondary,
        '&:hover > $content': {
            backgroundColor: theme.palette.action.hover,
        },
        '&:focus > $content, &$selected > $content': {
            backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
            color: 'var(--tree-view-color)',
        },
        '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
            backgroundColor: 'transparent',
        },
    },
    content: {
        color: theme.palette.text.secondary,
        borderTopRightRadius: theme.spacing(2),
        borderBottomRightRadius: theme.spacing(2),
        paddingRight: theme.spacing(1),
        fontWeight: theme.typography.fontWeightMedium,
        // '$expanded > &': {
        //   fontWeight: theme.typography.fontWeightRegular,
        // },
    },
    group: {
        marginLeft: 0,
        '& $content': {
            paddingLeft: theme.spacing(2),
        },
    },
    expanded: {},
    selected: {
        background: "transparent"
    },
    label: {
        fontWeight: 'inherit',
        color: 'inherit',
    },
    labelRoot: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(2, 0),
    },
    labelIcon: {
        marginRight: theme.spacing(1),
    },
    labelText: {
        fontWeight: "600",
        flexGrow: 1,
    },
}));

export default function CustomTreeItem(props) {
    const classes = useTreeItemStyles();
    const { link, labelText, labelIcon: LabelIcon, labelInfo, color, bgColor, ...other } = props;

    const renderTreeItem = () => <TreeItem
        label={
            <div className={classes.labelRoot}>
                {LabelIcon !== undefined && <LabelIcon color="inherit" className={classes.labelIcon} />}
                <Typography variant="body2" className={classes.labelText}>
                    {labelText}
                </Typography>
                <Typography variant="caption" color="inherit">
                    {labelInfo}
                </Typography>
            </div>
        }
        classes={{
            root: classes.root,
            content: classes.content,
            expanded: classes.expanded,
            selected: classes.selected,
            group: classes.group,
            label: classes.label,
        }}
        {...other}
    />

    return (
        link ?
            <Link to={link} style={{color: "inherit", textDecoration: "unset"}}>
                {renderTreeItem()}
            </Link>
            :
            renderTreeItem()
    );
}

CustomTreeItem.propTypes = {
    bgColor: PropTypes.string,
    color: PropTypes.string,
    labelIcon: PropTypes.elementType.isRequired,
    labelInfo: PropTypes.string,
    labelText: PropTypes.string.isRequired
};