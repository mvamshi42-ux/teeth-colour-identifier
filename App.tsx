import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dashboard } from './components/Dashboard';
import { SingleAnalysis } from './components/SingleAnalysis';
import { CompareAnalysis } from './components/CompareAnalysis';
import { PatientList } from './components/PatientList';
import { PatientDetail } from './components/PatientDetail';
import { HistoryComparison } from './components/HistoryComparison';
import { View, Patient, HistoryRecord } from './types';

interface AppData {
    patients: Patient[];
    analyses: HistoryRecord[];
}

const App: React.FC = () => {
    const [view, setView] = useState<View>('DASHBOARD');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [analyses, setAnalyses] = useState<HistoryRecord[]>([]);
    const [activePatientId, setActivePatientId] = useState<string | null>(null);
    const [compareRecordIds, setCompareRecordIds] = useState<[string, string] | null>(null);
    const isInitialLoad = useRef(true);

    // Effect for loading data ONCE on mount
    useEffect(() => {
        try {
            const savedData = localStorage.getItem('dentalShadeAppData');
            if (savedData) {
                const data: AppData = JSON.parse(savedData);
                setPatients(data.patients || []);
                setAnalyses(data.analyses || []);
            }
        } catch (e) {
            console.error("Failed to load data from localStorage", e);
        }
    }, []);

    // Effect for saving data to localStorage whenever it changes
    useEffect(() => {
        // Skip the very first render cycle before data has been loaded.
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }
        try {
            const appData: AppData = { patients, analyses };
            localStorage.setItem('dentalShadeAppData', JSON.stringify(appData));
        } catch (e) {
            console.error("Failed to save data to localStorage", e);
        }
    }, [patients, analyses]);
    
    const addPatient = useCallback((patient: Patient) => {
        setPatients(prev => [...prev, patient]);
    }, []);
    
    const deletePatient = useCallback((patientId: string) => {
        setPatients(prev => prev.filter(p => p.id !== patientId));
        setAnalyses(prev => prev.filter(a => a.patientId !== patientId));
    }, []);

    const addAnalysisToHistory = useCallback((record: HistoryRecord) => {
        setAnalyses(prev => [record, ...prev]);
    }, []);

    const deleteAnalysis = useCallback((analysisId: string) => {
        setAnalyses(prev => prev.filter(a => a.id !== analysisId));
    }, []);

    const handleNavigate = (newView: View, patientId?: string) => {
        if (patientId) setActivePatientId(patientId);
        setView(newView);
    };
    
    const handleCompare = (record1Id: string, record2Id: string) => {
        setCompareRecordIds([record1Id, record2Id]);
        setView('HISTORY_COMPARISON');
    };

    const renderView = () => {
        switch (view) {
            case 'PATIENT_LIST':
                return <PatientList patients={patients} onAddPatient={addPatient} onDeletePatient={deletePatient} onSelectPatient={(id) => handleNavigate('PATIENT_DETAIL', id)} setView={setView} />;
            case 'PATIENT_DETAIL':
                const patient = patients.find(p => p.id === activePatientId);
                if (!patient) return <Dashboard setView={setView} patients={patients} analyses={analyses} onAddPatient={addPatient} />; // Fallback to dashboard
                return <PatientDetail 
                    patient={patient} 
                    analyses={analyses.filter(a => a.patientId === patient.id)}
                    onNewAnalysis={() => handleNavigate('SINGLE_ANALYSIS', patient.id)}
                    onDeleteAnalysis={deleteAnalysis}
                    onCompare={handleCompare}
                    setView={setView}
                />;
            case 'SINGLE_ANALYSIS':
                 const analysisPatient = patients.find(p => p.id === activePatientId);
                 if (!analysisPatient) return <Dashboard setView={setView} patients={patients} analyses={analyses} onAddPatient={addPatient} />; // Fallback
                 return <SingleAnalysis patient={analysisPatient} onSave={addAnalysisToHistory} onBack={() => handleNavigate('PATIENT_DETAIL', analysisPatient.id)} />;
            case 'COMPARE_ANALYSIS':
                return <CompareAnalysis setView={setView} />;
            case 'HISTORY_COMPARISON':
                if (!compareRecordIds) return <Dashboard setView={setView} patients={patients} analyses={analyses} onAddPatient={addPatient} />; // Fallback
                const record1 = analyses.find(a => a.id === compareRecordIds[0]);
                const record2 = analyses.find(a => a.id === compareRecordIds[1]);
                if (!record1 || !record2) return <Dashboard setView={setView} patients={patients} analyses={analyses} onAddPatient={addPatient} />; // Fallback
                return <HistoryComparison record1={record1} record2={record2} onBack={() => handleNavigate('PATIENT_DETAIL', record1.patientId)} />;
            case 'DASHBOARD':
            default:
                return <Dashboard setView={setView} patients={patients} analyses={analyses} onAddPatient={addPatient} />;
        }
    }

    return (
        <div className="min-h-screen bg-slate-100/80 text-slate-800">
            {renderView()}
        </div>
    );
};

export default App;