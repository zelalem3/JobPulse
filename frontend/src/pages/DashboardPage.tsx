import React, { useEffect, useState } from 'react';
import { 
  BarChart3, Layers, Play, Pause, CheckCircle2, 
  AlertCircle, Clock, Server, Terminal, ArrowUpRight 
} from 'lucide-react';
import api from '../services/axios';



interface ScraperTask {
  id: string;
  target: string;
  frequency: string;
  status: 'idle' | 'running' | 'paused';
  lastRun: string;
  jobsFound: number;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  service: string;
}

export default function Dashboard() {

  useEffect(()=>{
    const getstats = async () =>
    {
      const response = await api.get("api/dashboard/stats");
      console.log(response.data);

    }
    getstats();
    
  }
  ,[])
 
  return (
    <>
    </>
  )
}