# Bayfair Transfer Tool

**Live Application:** [https://bayfair-transfer-tool.pages.dev/](https://bayfair-transfer-tool.pages.dev/)

## Overview

The Bayfair Transfer Tool is a web-based utility designed for Stirling Sports retail staff to facilitate inventory transfers between three branches:

- **BAY** - Bayfair
- **BST** - Bayfair Storage
- **BPU** - Bayfair Pop-up

This tool streamlines the process of creating properly formatted transfer files that can be imported into the "Counter Intelligence Office" retail management system.

## Features

- **Branch Selection**: Choose source and destination branches for transfers
- **Barcode Management**: Scan or manually enter product barcodes
- **Barcode Counter**: Track the number of items scanned in real-time
- **Transfer File Generation**: Create properly formatted .dat files for import
- **Transfer History**: Track and re-download transfers made during the current day
- **Data Persistence**: Automatically saves work in progress
- **Mobile Friendly**: Works on both desktop and mobile devices
- **Material Design**: Modern UI with Google Material Icons
- **Consistent Design System**: Standardized spacing, border radius, and padding throughout the app

## How to Use

1. **Select Branches**:
   - Choose the source branch (FROM) and destination branch (TO) using the dropdown selectors
   - Default is FROM BST TO BAY

2. **Enter Description**:
   - Provide a brief description of what you're transferring

3. **Add Barcodes**:
   - Scan product barcodes or enter them manually
   - Press Enter after each barcode
   - The barcode counter will update to show how many items you've scanned
   - Remove individual barcodes if needed

4. **Save File**:
   - Click "Save file" when all barcodes are added
   - A .dat file will be downloaded to your device
   - Format: `from_[SOURCE]_[DESCRIPTION]_[DATE]_[TIME].dat`

5. **Import to Counter Intelligence Office**:
   - Open "Counter Intelligence Office"
   - Select "Transfer"
   - Select "Enter or Modify a Transfer"
   - Select "Via PDE"
   - Upload the .dat file
   - Select the branch you're transferring from
   - Enter a description
   - Click "Start"

## Technical Details

- The app generates files in KUDOS V2 format
- Each barcode is formatted with proper padding
- The destination branch code is included for each item
- All transfers are tracked in browser storage for the current day
- Data is automatically cleared at the start of each new day
- Modular code organization for improved performance and maintainability:
  - `core.js`: Core functionality and state management
  - `ui.js`: User interface components and display functions
  - `storage.js`: Data persistence and storage management
  - `main.js`: Application initialization and event listeners
- CSS variables for consistent design system:
  - Standardized border radius values
  - Standardized padding values
  - Consistent color palette

## Version History

### v1.1.0 (Current)
- Added barcode counter to track scanned items in real-time
- Improved code organization with modular JavaScript files
- Improved overall application stability and maintainability
- Added support for Bayfair Pop-up (BPU) branch
- Improved branch selection with source and destination dropdowns
- Integrated Google Material Icons for a more modern UI
- Added visual indicators for actions and navigation
- Implemented consistent design system with standardized spacing and styling
- Improved visual distinction between informational elements and action buttons

### v1.0.0
- Initial release with support for transfers between BAY and BST
- Basic barcode scanning and management
- Transfer file generation in KUDOS V2 format

## Support

For questions or support, please contact the store manager or IT department.

Created by Preston Broad
