"use client"
import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AddBoxIcon from '@mui/icons-material/AddBox';
import FullFeaturedCrudGrid from '../c_bu/page';
import C_CD from '../c_cd/page';
import C_Centro_de_costo from '../c_Centro_de_costos/page';
import C_ER from '../c_ER/page';
import C_MAP from '../c_map/page';

const drawerWidth = 240;

export default function ResponsiveDrawer() {
  const [activeTab, setActiveTab] = useState('Inbox');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {[
          { text: 'Inicio', icon: <InboxIcon /> },
          { text: 'C_BU', icon: <AddBoxIcon /> },
          { text: 'C_CD', icon: <AddBoxIcon /> },
          { text: 'C_Centro_de_costo', icon: <AddBoxIcon /> },
          { text: 'C_ER', icon: <AddBoxIcon /> },
          { text: 'C_MAP', icon: <AddBoxIcon /> },
        ].map(({ text, icon }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={() => handleTabClick(text)}>
              <ListItemIcon>
                {icon}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </div>
  );

  return (
    <div>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Responsive drawer
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="mailbox folders"
        >
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
        >
          <Toolbar />
          <Typography paragraph>
            {activeTab === 'Inicio' && 'Text for Inbox Lorem'}
            {activeTab === 'C_BU' && <FullFeaturedCrudGrid/>}
            {activeTab === 'C_CD' && <C_CD/>}
            {activeTab === 'C_Centro_de_costo' && <C_Centro_de_costo/>}
            {activeTab === 'C_ER' && <C_ER/>}
            {activeTab === 'C_MAP' && <C_MAP/>}
            {/* Agrega más condiciones según las pestañas y textos Lorem que tengas */}
          </Typography>
        </Box>
      </Box>
    </div>
  );
}
