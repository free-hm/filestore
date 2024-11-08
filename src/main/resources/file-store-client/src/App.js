// src/App.js
import React from 'react';
import { FileManager } from './components/FileManager';

const App = () => {
    return (
        <div className="App" style={{ height: 12 }}>
            <h1>Chonky File Browser Example</h1>
            <FileManager />
        </div>
    );
};

export default App;
