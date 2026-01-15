
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { storageService } from '../services/storageService';
import { Idea, IdeaStatus } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminDashboardProps {
  onLogout: () => void;
}

const PAGE_SIZE = 10;

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(storageService.getStats());
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDetailExportMenu, setShowDetailExportMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const detailExportMenuRef = useRef<HTMLDivElement>(null);
  const detailPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = storageService.getIdeas();
    setIdeas(data);
    setStats(storageService.getStats());
    const interval = setInterval(() => {
      const freshData = storageService.getIdeas();
      setIdeas(freshData);
      setStats(storageService.getStats());
    }, 5000);

    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (detailExportMenuRef.current && !detailExportMenuRef.current.contains(event.target as Node)) {
        setShowDetailExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedIdea && window.innerWidth < 1280 && detailPanelRef.current) {
      detailPanelRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedIdea]);

  const handleUpdateIdea = (updated: Idea) => {
    storageService.updateIdea(updated);
    const freshData = storageService.getIdeas();
    setIdeas(freshData);
    setStats(storageService.getStats());
    setSelectedIdea(updated);
  };

  const handleIdeaReview = (i: Idea) => {
    if (!i.isRead) {
      const updated = { ...i, isRead: true };
      storageService.updateIdea(updated);
      const freshData = storageService.getIdeas();
      setIdeas(freshData);
      setSelectedIdea(updated);
    } else {
      setSelectedIdea(i);
    }
  };

  const filteredIdeas = useMemo(() => {
    return ideas.filter(i => {
      const matchesSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            i.referenceId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filter === 'All' || i.status === filter;
      return matchesSearch && matchesStatus;
    });
  }, [ideas, searchTerm, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredIdeas.length / PAGE_SIZE));
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  const paginatedIdeas = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredIdeas.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredIdeas, currentPage]);

  // UNIFIED EXPORT CONFIG (GLOBAL)
  const uniformHeaders = ["ID", "Title", "Dept", "Category", "Status", "Score", "Complexity", "Impact Vectors", "Admin Notes", "Content Details"];

  const exportExcel = () => {
    const colCount = uniformHeaders.length;
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Innovation Repository</x:Name>
                <x:WorksheetOptions>
                  <x:FitToPage/>
                  <x:Print>
                    <x:ValidPrinterInfo/>
                    <x:FitWidth>1</x:FitWidth>
                    <x:FitHeight>0</x:FitHeight>
                    <x:LeftMargin>0.3937</x:LeftMargin>
                    <x:RightMargin>0.3937</x:RightMargin>
                    <x:TopMargin>0.3937</x:TopMargin>
                    <x:BottomMargin>0.3937</x:BottomMargin>
                    <x:PrintOrientation>Landscape</x:PrintOrientation>
                  </x:Print>
                  <x:Selected/>
                  <x:Panes/>
                  <x:ProtectContents>False</x:ProtectContents>
                  <x:ProtectObjects>False</x:ProtectObjects>
                  <x:ProtectScenarios>False</x:ProtectScenarios>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          @page { size: landscape; margin: 1cm; }
          table { border-collapse: collapse; width: 100%; table-layout: fixed; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          .report-header { font-family: 'Segoe UI', Arial, sans-serif; font-size: 16pt; font-weight: bold; color: #1e40af; text-align: center; padding: 10px 0; }
          .report-meta { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8pt; color: #64748b; text-align: center; padding-bottom: 10px; }
          th { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8pt; font-weight: bold; text-transform: uppercase; background-color: #2563eb; color: #ffffff; border: 1pt solid #000000; padding: 8px; text-align: center; }
          td { font-family: 'Segoe UI', Arial, sans-serif; font-size: 7pt; border: 0.5pt solid #94a3b8; padding: 6px; vertical-align: top; text-align: center; word-wrap: break-word; overflow: hidden; }
          .title-cell { text-align: left; font-weight: bold; }
          .content-cell { text-align: left; font-size: 6.5pt; color: #334155; }
          .score-cell { font-weight: bold; color: #1e40af; mso-number-format: "\\@"; }
          .bg-alt { background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="${colCount}" class="report-header" style="border:none;">ISIP INNOVATION REPOSITORY</td></tr>
          <tr><td colspan="${colCount}" class="report-meta" style="border:none;">Total Information Management Corp. | Generated: ${new Date().toLocaleString()}</td></tr>
          <thead>
            <tr>
              ${uniformHeaders.map((h, i) => {
                let width = "60px";
                if (h === "Title") width = "120px";
                if (h === "Content Details") width = "220px";
                if (h === "Admin Notes") width = "120px";
                if (h === "Impact Vectors") width = "100px";
                return `<th style="width:${width}">${h}</th>`;
              }).join('')}
            </tr>
          </thead>
          <tbody>
            ${ideas.map((i, index) => {
              const fullContent = `Description: ${i.description} | Pain Point: ${i.painPoint} | Beneficiaries: ${i.beneficiaries}`;
              return `
                <tr class="${index % 2 === 0 ? '' : 'bg-alt'}">
                  <td>${i.referenceId}</td>
                  <td class="title-cell">${i.title}</td>
                  <td>${i.department}</td>
                  <td>${i.category}</td>
                  <td>${i.status}</td>
                  <td class="score-cell">${i.impactScore}/${i.feasibilityScore}</td>
                  <td>${i.complexity}</td>
                  <td>${i.impactTags.join(', ')}</td>
                  <td class="content-cell">${i.internalNotes || '-'}</td>
                  <td class="content-cell">${fullContent}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ISIP_Report_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFontSize(18);
    doc.setTextColor(30, 64, 175);
    doc.text("ISIP INNOVATION REPOSITORY", 148.5, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Total Information Management Corp. | Generated: ${new Date().toLocaleString()}`, 148.5, 22, { align: 'center' });

    const tableData = ideas.map(i => [
      i.referenceId,
      i.title,
      i.department,
      i.category,
      i.status,
      `${i.impactScore}/${i.feasibilityScore}`,
      i.complexity,
      i.impactTags.join(', '),
      i.internalNotes || '-',
      `Description: ${i.description}\nPain Point: ${i.painPoint}\nBeneficiaries: ${i.beneficiaries}`
    ]);

    autoTable(doc, {
      head: [uniformHeaders],
      body: tableData,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], halign: 'center', fontSize: 7, fontStyle: 'bold' },
      styles: { fontSize: 6, halign: 'center', cellPadding: 2, overflow: 'linebreak' },
      columnStyles: { 
        // Fix: Replace 'width' with 'cellWidth' as per jspdf-autotable documentation
        1: { halign: 'left', cellWidth: 25 },
        6: { cellWidth: 20 },
        7: { halign: 'left', cellWidth: 25 },
        8: { halign: 'left', cellWidth: 35 },
        9: { halign: 'left', cellWidth: 60 }
      },
      margin: { top: 30, bottom: 20, left: 10, right: 10 },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.text(`Page ${data.pageNumber}`, 280, 200, { align: 'right' });
      }
    });

    doc.save(`ISIP_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportMenu(false);
  };

  const exportWord = () => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <style>
          @page { size: 29.7cm 21cm; margin: 1cm; mso-page-orientation: landscape; }
          body { font-family: 'Segoe UI', sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #2563eb; color: #ffffff; padding: 5pt; font-size: 9pt; border: 1pt solid #000; }
          td { padding: 5pt; border: 1pt solid #94a3b8; font-size: 8pt; vertical-align: top; }
        </style>
      </head>
      <body>
        <h1 style="color: #1e40af; text-align: center; font-size: 20pt; margin-bottom: 5pt;">ISIP INNOVATION REPOSITORY</h1>
        <p style="text-align: center; color: #64748b; font-size: 9pt; margin-bottom: 20pt;">Total Information Management Corp. | Generated: ${new Date().toLocaleString()}</p>
        <table border="1">
          <thead>
            <tr style="text-transform: uppercase;">
              ${uniformHeaders.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${ideas.map(i => {
              const fullContent = `<b>Description:</b> ${i.description}<br/><b>Pain Point:</b> ${i.painPoint}<br/><b>Beneficiaries:</b> ${i.beneficiaries}`;
              return `
                <tr>
                  <td style="text-align: center;">${i.referenceId}</td>
                  <td style="font-weight: bold;">${i.title}</td>
                  <td style="text-align: center;">${i.department}</td>
                  <td style="text-align: center;">${i.category}</td>
                  <td style="text-align: center;">${i.status}</td>
                  <td style="text-align: center; font-weight: bold; color: #1e40af;">${i.impactScore}/${i.feasibilityScore}</td>
                  <td style="text-align: center;">${i.complexity}</td>
                  <td>${i.impactTags.join(', ')}</td>
                  <td>${i.internalNotes || '-'}</td>
                  <td style="font-size: 7pt;">${fullContent}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ISIP_Report_${new Date().toISOString().split('T')[0]}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportDetailPDF = () => {
    if (!selectedIdea) return;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    const i = selectedIdea;

    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175);
    doc.text("ISIP INDIVIDUAL PROPOSAL", 105, 20, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Reference ID: ${i.referenceId} | Generated: ${new Date().toLocaleString()}`, 105, 27, { align: 'center' });

    const data = [
      ["Proposal Headline", i.title],
      ["Submission Date", new Date(i.timestamp).toLocaleString()],
      ["Owner / Author", i.isAnonymous ? "Anonymous Submission" : i.name],
      ["Department", i.department],
      ["Position / Role", i.role],
      ["Status", i.status],
      ["Category", i.category],
      ["Problem / Pain Point", i.painPoint],
      ["Solution Mechanics", i.description],
      ["Beneficiaries", i.beneficiaries],
      ["Stated Complexity", i.complexity],
      ["Impact Vectors", i.impactTags.join(', ')],
      ["AI Impact Score", `${i.impactScore}/10`],
      ["AI Feasibility Score", `${i.feasibilityScore}/10`],
      ["Admin Assessment", i.internalNotes || "No assessment notes recorded."]
    ];

    autoTable(doc, {
      body: data,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
      // Fix: Replace 'width' with 'cellWidth'
      columnStyles: { 0: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 50 } },
      margin: { top: 35, bottom: 20, left: 20, right: 20 }
    });

    doc.save(`${i.referenceId}_Details.pdf`);
    setShowDetailExportMenu(false);
  };

  const exportDetailExcel = () => {
    if (!selectedIdea) return;
    const i = selectedIdea;
    const data = [
      ["Field", "Response"],
      ["Reference ID", i.referenceId],
      ["Proposal Headline", i.title],
      ["Submission Date", new Date(i.timestamp).toLocaleString()],
      ["Author", i.isAnonymous ? "Anonymous" : i.name],
      ["Department", i.department],
      ["Role", i.role],
      ["Category", i.category],
      ["Pain Point", i.painPoint],
      ["Description", i.description],
      ["Beneficiaries", i.beneficiaries],
      ["Complexity", i.complexity],
      ["Impact Tags", i.impactTags.join(', ')],
      ["Impact Score", i.impactScore],
      ["Feasibility Score", i.feasibilityScore],
      ["Status", i.status],
      ["Admin Notes", i.internalNotes]
    ];

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          @page { size: A4 portrait; margin: 1cm; }
          th { background-color: #2563eb; color: #ffffff; }
          td { vertical-align: top; }
        </style>
      </head>
      <body>
        <table border="1">
          <thead>
            <tr style="background-color: #2563eb; color: #ffffff; font-weight: bold;">
              <th style="width: 200px;">Question / Field</th>
              <th style="width: 400px;">Response Details</th>
            </tr>
          </thead>
          <tbody>
            ${data.slice(1).map(row => `
              <tr>
                <td style="background-color: #f1f5f9; font-weight: bold; width: 200px;">${row[0]}</td>
                <td style="width: 400px; white-space: pre-wrap;">${row[1]}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${i.referenceId}_Proposal.xls`;
    link.click();
    URL.revokeObjectURL(url);
    setShowDetailExportMenu(false);
  };

  const exportDetailWord = () => {
    if (!selectedIdea) return;
    const i = selectedIdea;
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <style>
          @page { size: 21cm 29.7cm; margin: 2cm; }
          body { font-family: 'Segoe UI', sans-serif; }
        </style>
      </head>
      <body style="padding: 40px;">
        <h1 style="color: #1e40af; border-bottom: 2pt solid #1e40af; padding-bottom: 10pt; font-size: 24pt;">${i.referenceId}: ${i.title}</h1>
        <p style="color: #64748b; font-size: 10pt;"><b>Category:</b> ${i.category} | <b>Status:</b> ${i.status}</p>
        
        <h3 style="background-color: #f1f5f9; padding: 5pt; border-left: 4pt solid #2563eb; font-size: 12pt;">General Information</h3>
        <p style="font-size: 10pt;"><b>Submitted By:</b> ${i.isAnonymous ? "Anonymous" : i.name}</p>
        <p style="font-size: 10pt;"><b>Department:</b> ${i.department}</p>
        <p style="font-size: 10pt;"><b>Designation:</b> ${i.role}</p>
        <p style="font-size: 10pt;"><b>Date:</b> ${new Date(i.timestamp).toLocaleString()}</p>

        <h3 style="background-color: #f1f5f9; padding: 5pt; border-left: 4pt solid #2563eb; font-size: 12pt;">The Proposal</h3>
        <p style="font-size: 10pt;"><b>Identified Pain Point:</b><br/>${i.painPoint}</p>
        <p style="font-size: 10pt;"><b>Solution Mechanics:</b><br/>${i.description}</p>
        <p style="font-size: 10pt;"><b>Beneficiaries:</b> ${i.beneficiaries}</p>

        <h3 style="background-color: #f1f5f9; padding: 5pt; border-left: 4pt solid #2563eb; font-size: 12pt;">Assessment</h3>
        <p style="font-size: 10pt;"><b>Stated Complexity:</b> ${i.complexity}</p>
        <p style="font-size: 10pt;"><b>Impact Score:</b> ${i.impactScore}/10</p>
        <p style="font-size: 10pt;"><b>Feasibility Score:</b> ${i.feasibilityScore}/10</p>
        <p style="font-size: 10pt;"><b>Impact Tags:</b> ${i.impactTags.join(', ')}</p>

        <h3 style="background-color: #f1f5f9; padding: 5pt; border-left: 4pt solid #2563eb; font-size: 12pt;">Admin Management</h3>
        <p style="font-size: 10pt;"><b>Internal Notes:</b><br/>${i.internalNotes || "No notes available."}</p>
      </body>
      </html>
    `;
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${i.referenceId}_Proposal.doc`;
    link.click();
    URL.revokeObjectURL(url);
    setShowDetailExportMenu(false);
  };

  const getStatusColor = (status: IdeaStatus) => {
    switch (status) {
      case 'Review': return 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 border-amber-500/20';
      case 'Pilot': return 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-500 border-blue-500/20';
      case 'Implemented': return 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 border-emerald-500/20';
      case 'Deferred': return 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-500 border-slate-500/20';
    }
  };

  const statCards = [
    { label: 'Repository', subLabel: 'Total Submissions', val: stats.total, color: 'blue', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 v2M7 7h10" /></svg>, bgClass: 'bg-blue-50 dark:bg-blue-500/10', iconClass: 'text-blue-600 dark:text-blue-500 border-blue-500/20', borderClass: 'border-blue-100 dark:border-blue-900/50' },
    { label: 'Queue', subLabel: 'Pending Review', val: stats.byStatus.Review, color: 'amber', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, bgClass: 'bg-amber-50 dark:bg-amber-500/10', iconClass: 'text-amber-600 dark:text-amber-500 border-amber-500/20', borderClass: 'border-amber-100 dark:border-amber-900/50' },
    { label: 'Lab', subLabel: 'Active Pilots', val: stats.byStatus.Pilot, color: 'indigo', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.675.337a4 4 0 01-1.778.417H7.5a2 2 0 01-2-2V10a2 2 0 012-2h1.5a2 2 0 012-2h1.5a2 2 0 002-2V4.5a2 2 0 114 0V6a2 2 0 002 2h1a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 012 2v1a2 2 0 01-2 2h-1.572" /></svg>, bgClass: 'bg-indigo-50 dark:bg-indigo-500/10', iconClass: 'text-indigo-600 dark:text-indigo-400 border-indigo-500/20', borderClass: 'border-indigo-100 dark:border-indigo-900/50' },
    { label: 'Success', subLabel: 'Implemented Ideas', val: stats.byStatus.Implemented, color: 'emerald', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, bgClass: 'bg-emerald-50 dark:bg-emerald-500/10', iconClass: 'text-emerald-600 dark:text-emerald-500 border-emerald-500/20', borderClass: 'border-emerald-100 dark:border-emerald-900/50' },
  ];

  const isIdeaNew = (i: Idea) => {
    return !i.isRead;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12 sm:pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            OCD Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 font-medium mt-1">Strategic Portfolio Insights</p>
        </div>
        
        <div className="flex items-center">
          <div className="relative" ref={exportMenuRef}>
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center space-x-3 shadow-sm"
            >
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span>Export All</span>
              <svg className={`w-3 h-3 transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-[80] overflow-hidden animate-fade-in py-1">
                <button onClick={exportExcel} className="w-full px-5 py-4 flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group">
                  <div className="w-8 h-8 bg-emerald-500/10 text-emerald-600 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div>
                  <div><p className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-widest">Excel / XLS</p><p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Spreadsheet</p></div>
                </button>
                <button onClick={exportPDF} className="w-full px-4 py-4 flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group">
                  <div className="w-8 h-8 bg-rose-500/10 text-rose-600 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div>
                  <div><p className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-widest">PDF Doc</p><p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Executive</p></div>
                </button>
                <button onClick={exportWord} className="w-full px-5 py-4 flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group">
                  <div className="w-8 h-8 bg-blue-500/10 text-blue-600 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                  <div><p className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-widest">Word / DOC</p><p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Document</p></div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statCards.map((s, i) => (
          <div key={i} className={`bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border ${s.borderClass} flex items-center justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all`}>
            <div className="relative z-10">
              <p className={`text-[8px] sm:text-[9px] font-black uppercase tracking-wider mb-0.5 sm:mb-1 ${s.iconClass.split(' ')[0]}`}>{s.label}</p>
              <p className="text-xl sm:text-4xl font-black text-slate-900 dark:text-white leading-none">{s.val}</p>
              <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1.5">{s.subLabel}</p>
            </div>
            <div className={`w-10 h-10 sm:w-14 sm:h-14 ${s.bgClass} ${s.iconClass} rounded-xl sm:rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform relative z-10 shadow-inner`}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 items-start">
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 bg-slate-50 dark:bg-slate-950/50">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Filter record..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl px-10 sm:px-12 py-2 sm:py-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-inner"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 outline-none shadow-sm"
              >
                <option value="All">All Status</option>
                <option value="Review">Review</option>
                <option value="Pilot">Pilot</option>
                <option value="Implemented">Implemented</option>
                <option value="Deferred">Deferred</option>
              </select>
            </div>
            
            <div className="overflow-x-auto no-scrollbar">
              <table className="min-w-[800px] sm:min-w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80">
                    <th className="px-6 sm:px-8 py-3 sm:py-4 text-left text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Idea</th>
                    <th className="px-6 sm:px-8 py-3 sm:py-4 text-left text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:table-cell">Dept</th>
                    <th className="px-6 sm:px-8 py-3 sm:py-4 text-left text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden md:table-cell">Category</th>
                    <th className="px-6 sm:px-8 py-3 sm:py-4 text-left text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Score</th>
                    <th className="px-6 sm:px-8 py-3 sm:py-4 text-right text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {paginatedIdeas.map(i => {
                    const isNew = isIdeaNew(i);
                    return (
                      <tr 
                        key={i.id} 
                        onClick={() => handleIdeaReview(i)}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer group ${selectedIdea?.id === i.id ? 'bg-blue-600/5 border-l-4 border-l-blue-600' : ''}`}
                      >
                        <td className="px-6 sm:px-8 py-4 sm:py-5">
                          <div className="flex items-center space-x-2 mb-0.5">
                            <span className="text-[8px] sm:text-[9px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-tighter">{i.referenceId}</span>
                            {isNew && (
                              <span className="text-[7px] sm:text-[8px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-1 rounded animate-pulse">NEW</span>
                            )}
                          </div>
                          <div className="text-[11px] sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-white transition-colors truncate max-w-[150px] sm:max-w-[200px]">{i.title}</div>
                        </td>
                        <td className="px-6 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase hidden sm:table-cell">{i.department}</td>
                        <td className="px-6 sm:px-8 py-4 sm:py-5 text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase hidden md:table-cell">{i.category}</td>
                        <td className="px-6 sm:px-8 py-4 sm:py-5 text-center">
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                             <span className="text-[8px] sm:text-[9px] font-black bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-blue-600">I:{i.impactScore}</span>
                             <span className="text-[8px] sm:text-[9px] font-black bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-emerald-600">F:{i.feasibilityScore}</span>
                          </div>
                        </td>
                        <td className="px-6 sm:px-8 py-4 sm:py-5 text-right">
                          <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[7px] sm:text-[9px] font-black uppercase tracking-widest border whitespace-nowrap ${getStatusColor(i.status)}`}>
                            {i.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedIdeas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No matching records found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 sm:px-8 py-6 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page</span>
                  <span className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-[11px] font-black text-white shadow-lg">{currentPage}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">of {totalPages}</span>
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6" ref={detailPanelRef}>
          {selectedIdea ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl p-0 sticky top-20 sm:top-24 overflow-hidden flex flex-col max-h-[calc(100vh-100px)] xl:max-h-[calc(100vh-140px)]">
               <div className="p-6 sm:p-8 pb-4 relative z-10 flex items-start justify-between bg-white dark:bg-slate-900 border-b border-slate-50 dark:border-slate-800">
                  <div className="min-w-0 pr-4">
                    <span className="text-[9px] sm:text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest">{selectedIdea.referenceId}</span>
                    <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 truncate">{selectedIdea.title}</h2>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <div className="relative" ref={detailExportMenuRef}>
                      <button 
                        onClick={() => setShowDetailExportMenu(!showDetailExportMenu)}
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Export Proposal"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </button>
                      
                      {showDetailExportMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-[90] overflow-hidden animate-fade-in py-1">
                          <button onClick={exportDetailExcel} className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group">
                            <span className="text-[9px] font-black uppercase text-slate-900 dark:text-white tracking-widest">Excel</span>
                          </button>
                          <button onClick={exportDetailPDF} className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group">
                            <span className="text-[9px] font-black uppercase text-slate-900 dark:text-white tracking-widest">PDF</span>
                          </button>
                          <button onClick={exportDetailWord} className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group">
                            <span className="text-[9px] font-black uppercase text-slate-900 dark:text-white tracking-widest">Word</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <button onClick={() => setSelectedIdea(null)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
               </div>

               <div className="flex-grow overflow-y-auto px-6 sm:px-8 pb-8 space-y-6 sm:space-y-8 no-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-slate-50 dark:bg-slate-950/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner">
                     <div className="space-y-1">
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Submitted By</p>
                        <p className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white truncate">{selectedIdea.isAnonymous ? 'Anonymous' : selectedIdea.name}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Designation</p>
                        <p className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white uppercase truncate">{selectedIdea.role}</p>
                     </div>
                     <div className="space-y-1 col-span-full">
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Department</p>
                        <p className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white uppercase">{selectedIdea.department}</p>
                     </div>
                  </div>

                  <div className="space-y-5 sm:space-y-6">
                    <div className="flex items-center space-x-2">
                       <h3 className="text-[9px] sm:text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest">Idea Intelligence</h3>
                       <div className="flex-grow h-px bg-slate-100 dark:bg-slate-800"></div>
                    </div>

                    <div className="space-y-4 sm:space-y-5">
                      <div className="space-y-1">
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Solution Description</p>
                        <textarea
                          rows={4}
                          value={selectedIdea.description}
                          onChange={e => handleUpdateIdea({...selectedIdea, description: e.target.value})}
                          className="w-full text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-slate-50/50 dark:bg-slate-950/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800/50 outline-none focus:border-blue-500 resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Pain Point Resolved</p>
                        <textarea
                          rows={3}
                          value={selectedIdea.painPoint}
                          onChange={e => handleUpdateIdea({...selectedIdea, painPoint: e.target.value})}
                          className="w-full text-[11px] sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-slate-50/50 dark:bg-slate-950/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800/50 outline-none focus:border-blue-500 resize-none italic"
                        />
                      </div>

                      <div className="space-y-1">
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Impact Vectors</p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {selectedIdea.impactTags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 sm:space-y-6 pt-6 sm:pt-8 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-2">
                       <h3 className="text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Management Console</h3>
                       <div className="flex-grow h-px bg-slate-100 dark:bg-slate-800"></div>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                       <div className="space-y-2">
                          <label className="text-[8px] sm:text-[9px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest flex items-center">Workflow Status</label>
                          <select
                            value={selectedIdea.status}
                            onChange={e => handleUpdateIdea({...selectedIdea, status: e.target.value as IdeaStatus})}
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black uppercase text-slate-900 dark:text-white outline-none focus:border-blue-500"
                          >
                            <option value="Review">Review</option>
                            <option value="Pilot">Pilot</option>
                            <option value="Implemented">Implemented</option>
                            <option value="Deferred">Deferred</option>
                          </select>
                       </div>

                       <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-2">
                             <label className="text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Impact (1-10)</label>
                             <input
                               type="number" min="0" max="10"
                               value={selectedIdea.impactScore}
                               onChange={e => {
                                 const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                 handleUpdateIdea({...selectedIdea, impactScore: val});
                               }}
                               className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl px-4 py-2 sm:py-3 text-xs sm:text-sm font-black text-slate-900 dark:text-white outline-none focus:border-blue-500"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Ease (1-10)</label>
                             <input
                               type="number" min="0" max="10"
                               value={selectedIdea.feasibilityScore}
                               onChange={e => {
                                 const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                 handleUpdateIdea({...selectedIdea, feasibilityScore: val});
                               }}
                               className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl px-4 py-2 sm:py-3 text-xs sm:text-sm font-black text-slate-900 dark:text-white outline-none focus:border-blue-500"
                             />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Admin Notes</label>
                          <textarea
                            rows={4}
                            value={selectedIdea.internalNotes}
                            onChange={e => handleUpdateIdea({...selectedIdea, internalNotes: e.target.value})}
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl sm:rounded-3xl px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 resize-none"
                            placeholder="Next steps..."
                          ></textarea>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="h-[250px] sm:h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[3rem] border border-slate-200 dark:border-slate-800 border-dashed border-2 opacity-30 shadow-sm mx-2 sm:mx-0">
               <svg className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
               <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-600 px-8">Select an idea<br/>to begin management</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
