
import React, { useState } from 'react';
import Layout from './components/Layout';
import Overview from './components/Overview';
import CreativeAnalysis from './components/CreativeAnalysis';
import PersonnelDataPage from './components/PersonnelData';
import MaterialDetails from './components/MaterialDetails';
import TagManagement from './components/TagManagement';
import RequirementCenter from './components/RequirementCenter';
import IterationRecord from './components/IterationRecord';
import Benchmark from './components/Benchmark';
import AssetLibrary from './components/AssetLibrary';
import { UiSpecificationPage } from './components/UiSpecification';
import { MainModule, Page } from './types';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<MainModule>(MainModule.REQUIREMENT_CENTER);
  const [currentPage, setCurrentPage] = useState<Page>(Page.OVERVIEW);
  const [creativeSubTab, setCreativeSubTab] = useState<'multi' | 'full' | 'segment_a' | 'segment_b'>('full');
  const [requirementSubView, setRequirementSubView] = useState<'coordinated' | 'list' | 'schedules' | 'upload'>('coordinated');

  return (
    <Layout 
      activeModule={activeModule} 
      onModuleNavigate={setActiveModule}
      currentPage={currentPage} 
      onPageNavigate={setCurrentPage}
      creativeSubTab={creativeSubTab}
      onCreativeSubTabChange={setCreativeSubTab}
      requirementSubView={requirementSubView}
      onRequirementSubViewChange={setRequirementSubView}
    >
      {activeModule === MainModule.UI_SPECIFICATION ? (
        <UiSpecificationPage />
      ) : activeModule === MainModule.TAG_MANAGEMENT ? (
        <TagManagement />
      ) : activeModule === MainModule.REQUIREMENT_CENTER ? (
        <RequirementCenter 
          subView={requirementSubView} 
          onSubViewChange={setRequirementSubView} 
        />
      ) : activeModule === MainModule.ITERATION_RECORD ? (
        <IterationRecord />
      ) : activeModule === MainModule.ASSET_LIBRARY ? (
        <AssetLibrary />
      ) : (
        (() => {
          switch (currentPage) {
            case Page.OVERVIEW: return <Overview />;
            case Page.DETAILS: return <MaterialDetails />;
            case Page.CREATIVE_ANALYSIS: return <CreativeAnalysis activeSubTab={creativeSubTab} />;
            case Page.PERSONNEL: return <PersonnelDataPage />;
            case Page.BENCHMARK: return <Benchmark />;
            default: return <Overview />;
          }
        })()
      )}
    </Layout>
  );
};

export default App;
