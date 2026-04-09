/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  User, 
  Zap, 
  TrendingUp, 
  Info, 
  Code, 
  Database, 
  Server, 
  Cpu,
  RefreshCw,
  Search,
  ShoppingCart,
  Eye,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  MousePointer2,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { products, mockUser } from './mockData';
import { Product, UserProfile, Recommendation, RecommendationResponse } from './types';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function App() {
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lastActivity, setLastActivity] = useState<string>('System initialized');
  const [segment, setSegment] = useState<string>('General');

  // Simulate browsing behavior
  const trackClick = (productId: string) => {
    const newActivity = {
      productId,
      dwellTime: Math.floor(Math.random() * 60) + 10,
      clicks: 1,
      timestamp: new Date().toISOString()
    };
    
    setUser(prev => ({
      ...prev,
      browsingHistory: [newActivity, ...prev.browsingHistory].slice(0, 10)
    }));
    
    setLastActivity(`User clicked on product: ${products.find(p => p.id === productId)?.name}`);
  };

  const addToCart = (productId: string) => {
    if (!user.cart.includes(productId)) {
      setUser(prev => ({
        ...prev,
        cart: [...prev.cart, productId]
      }));
      setLastActivity(`User added to cart: ${products.find(p => p.id === productId)?.name}`);
    }
  };

  // Recommendation Engine using Gemini
  const generateRecommendations = async () => {
    if (!process.env.GEMINI_API_KEY) {
      console.error("Gemini API key is missing");
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `
        You are an advanced e-commerce recommendation engine.
        Analyze the following user data and product catalog to generate 3-5 highly personalized recommendations.
        
        USER DATA:
        - Name: ${user.name}
        - Age: ${user.age}
        - Location: ${user.location}
        - Income: ${user.incomeLevel}
        - Purchase History: ${user.purchaseHistory.join(', ')}
        - Browsing History (Recent): ${JSON.stringify(user.browsingHistory)}
        - Search Queries: ${user.searchQueries.join(', ')}
        - Current Cart: ${user.cart.join(', ')}
        
        PRODUCT CATALOG:
        ${JSON.stringify(products)}
        
        REQUIREMENTS:
        1. Use a hybrid approach (collaborative + content-based).
        2. Provide a confidence score (0-1).
        3. Provide a clear explanation for each recommendation (Explainable AI).
        4. Suggest 2 cross-sell items for each recommendation.
        5. Provide price optimization insights (dynamic pricing).
        6. Identify the user segment (e.g., "Tech Enthusiast", "Budget Conscious").
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    productId: { type: Type.STRING },
                    confidenceScore: { type: Type.NUMBER },
                    explanation: { type: Type.STRING },
                    crossSellSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    priceOptimization: {
                      type: Type.OBJECT,
                      properties: {
                        originalPrice: { type: Type.NUMBER },
                        optimizedPrice: { type: Type.NUMBER },
                        discountLikelihood: { type: Type.NUMBER },
                        reason: { type: Type.STRING }
                      }
                    }
                  }
                }
              },
              segment: { type: Type.STRING }
            }
          }
        }
      });

      const data = JSON.parse(response.text) as RecommendationResponse;
      setRecommendations(data.recommendations);
      setSegment(data.segment);
      setLastActivity(`New recommendations generated for segment: ${data.segment}`);
    } catch (error) {
      console.error("Error generating recommendations:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Initial generation
  useEffect(() => {
    generateRecommendations();
  }, []);

  // Re-generate when cart changes (simulating real-time engine)
  useEffect(() => {
    if (user.cart.length > 0) {
      const timer = setTimeout(() => {
        generateRecommendations();
      }, 2000); // Debounce
      return () => clearTimeout(timer);
    }
  }, [user.cart]);

  // Charts Data
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <Zap className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">RecEngine <span className="text-indigo-600">AI</span></span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-1 text-sm font-medium text-slate-500 md:flex">
              <Clock className="h-4 w-4" />
              <span>Last Activity: {lastActivity}</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-slate-500">{segment}</p>
              </div>
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-indigo-100 bg-slate-200">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <TabsList className="bg-white p-1 shadow-sm">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="catalog" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                <ShoppingBag className="mr-2 h-4 w-4" /> Catalog
              </TabsTrigger>
              <TabsTrigger value="architecture" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                <Server className="mr-2 h-4 w-4" /> Architecture
              </TabsTrigger>
              <TabsTrigger value="docs" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                <Code className="mr-2 h-4 w-4" /> Developer Docs
              </TabsTrigger>
            </TabsList>

            <Button 
              onClick={generateRecommendations} 
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isGenerating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
              Refresh Recommendations
            </Button>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              {/* User Context Card */}
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">User Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Demographics</span>
                    <span className="text-sm font-semibold">{user.age}y, {user.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Income Level</span>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                      {user.incomeLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Cart Items</span>
                    <span className="text-sm font-semibold">{user.cart.length}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Recent Searches</span>
                    <div className="flex flex-wrap gap-1">
                      {user.searchQueries.map((q, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">{q}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Real-time Stats Card */}
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Behavioral Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[120px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData}>
                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>Browsing Intensity</span>
                    <span className="font-bold text-indigo-600">High</span>
                  </div>
                </CardContent>
              </Card>

              {/* Segment Card */}
              <Card className="border-none bg-indigo-600 text-white shadow-lg shadow-indigo-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium uppercase tracking-wider opacity-80">Current Segment</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="mb-2 rounded-full bg-white/20 p-3">
                    <User className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold">{segment}</h3>
                  <p className="mt-2 text-xs opacity-70">Based on hybrid filtering of behavior and demographics</p>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Personalized Recommendations</h2>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Info className="h-4 w-4" />
                  <span>Powered by Gemini 3 Flash Hybrid Engine</span>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {isGenerating ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Card key={`skeleton-${i}`} className="animate-pulse border-none shadow-sm">
                        <div className="h-48 bg-slate-200" />
                        <CardHeader>
                          <div className="h-6 w-3/4 bg-slate-200 rounded" />
                          <div className="h-4 w-1/2 bg-slate-200 rounded" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="h-4 w-full bg-slate-200 rounded" />
                          <div className="h-4 w-full bg-slate-200 rounded" />
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    recommendations.map((rec, index) => {
                      const product = products.find(p => p.id === rec.productId);
                      if (!product) return null;
                      return (
                        <motion.div
                          key={rec.productId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="group overflow-hidden border-none shadow-sm transition-all hover:shadow-xl">
                            <div className="relative h-48 overflow-hidden">
                              <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute top-3 right-3">
                                <Badge className="bg-white/90 text-indigo-600 backdrop-blur-sm">
                                  {Math.round(rec.confidenceScore * 100)}% Match
                                </Badge>
                              </div>
                              {rec.priceOptimization.discountLikelihood > 0.7 && (
                                <div className="absolute bottom-3 left-3">
                                  <Badge className="bg-orange-500 text-white border-none">
                                    Flash Deal Potential
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-lg">{product.name}</CardTitle>
                                  <CardDescription>{product.category}</CardDescription>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-indigo-600">${rec.priceOptimization.optimizedPrice.toFixed(2)}</p>
                                  {rec.priceOptimization.optimizedPrice < rec.priceOptimization.originalPrice && (
                                    <p className="text-xs text-slate-400 line-through">${rec.priceOptimization.originalPrice.toFixed(2)}</p>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="rounded-lg bg-indigo-50/50 p-3 text-xs leading-relaxed text-indigo-900 border border-indigo-100">
                                <div className="mb-1 flex items-center gap-1 font-bold text-indigo-700">
                                  <CheckCircle2 className="h-3 w-3" /> Why this?
                                </div>
                                {rec.explanation}
                              </div>
                              
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase text-slate-400">Cross-sell Opportunities</p>
                                <div className="flex gap-2">
                                  <TooltipProvider>
                                    {rec.crossSellSuggestions.map(id => {
                                      const p = products.find(item => item.id === id);
                                      return p ? (
                                        <React.Fragment key={id}>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div className="h-10 w-10 rounded-md border border-slate-100 bg-slate-50 p-1 cursor-help">
                                                <img src={p.imageUrl} alt={p.name} className="h-full w-full rounded object-cover" referrerPolicy="no-referrer" />
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p className="text-xs">{p.name}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </React.Fragment>
                                      ) : null;
                                    })}
                                  </TooltipProvider>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                              <Button 
                                className="w-full bg-slate-900 hover:bg-black"
                                onClick={() => addToCart(product.id)}
                              >
                                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>

          {/* Catalog Tab */}
          <TabsContent value="catalog">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="md:col-span-1 space-y-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500">Search</label>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <input className="w-full rounded-md border border-slate-200 py-2 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Search products..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500">Categories</label>
                      <div className="space-y-1">
                        {categoryData.map(cat => (
                          <div key={cat.name} className="flex items-center justify-between rounded-md p-2 hover:bg-slate-50 cursor-pointer">
                            <span className="text-sm">{cat.name}</span>
                            <Badge variant="secondary" className="text-[10px]">{cat.value}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-3">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map(product => (
                    <Card key={product.id} className="border-none shadow-sm hover:ring-2 hover:ring-indigo-500 transition-all">
                      <div className="aspect-video overflow-hidden">
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{product.name}</CardTitle>
                        <CardDescription className="line-clamp-1">{product.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="flex items-center justify-between p-4 pt-0">
                        <span className="font-bold text-indigo-600">${product.price}</span>
                        <div className="flex gap-2">
                          <Button size="icon" variant="outline" onClick={() => trackClick(product.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" onClick={() => addToCart(product.id)}>
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture">
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>System Architecture</CardTitle>
                  <CardDescription>Event-driven hybrid recommendation pipeline</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative space-y-12 pl-8 before:absolute before:left-3 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-slate-200">
                    <div className="relative">
                      <div className="absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                        <MousePointer2 className="h-3 w-3" />
                      </div>
                      <h4 className="font-bold">Data Ingestion Layer</h4>
                      <p className="text-sm text-slate-500">Real-time tracking of clicks, dwell time, and search queries via WebSocket/Streaming.</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                        <Database className="h-3 w-3" />
                      </div>
                      <h4 className="font-bold">Feature Store</h4>
                      <p className="text-sm text-slate-500">Aggregated user profiles and product embeddings stored in a vector database (e.g., Pinecone/Vertex AI).</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                        <Cpu className="h-3 w-3" />
                      </div>
                      <h4 className="font-bold">Hybrid Inference Engine</h4>
                      <p className="text-sm text-slate-500">Combines Collaborative Filtering (ALS/Matrix Factorization) with Content-based (Transformers) using Gemini for reasoning.</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                        <TrendingUp className="h-3 w-3" />
                      </div>
                      <h4 className="font-bold">Dynamic Pricing & Optimization</h4>
                      <p className="text-sm text-slate-500">Real-time price adjustments based on inventory levels, user elasticity, and demand forecasting.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Tech Stack Recommendations</CardTitle>
                  <CardDescription>Scalable production-ready components</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Frontend</p>
                      <p className="text-sm font-semibold">React + Vite + Tailwind</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Backend</p>
                      <p className="text-sm font-semibold">Node.js / Python Fast API</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-[10px] font-bold uppercase text-slate-400">ML Pipeline</p>
                      <p className="text-sm font-semibold">Vertex AI / PyTorch</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Database</p>
                      <p className="text-sm font-semibold">PostgreSQL + Redis</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Vector Search</p>
                      <p className="text-sm font-semibold">Pinecone / Milvus</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Streaming</p>
                      <p className="text-sm font-semibold">Apache Kafka / PubSub</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold">Evaluation Metrics</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Precision@K</Badge>
                      <Badge variant="outline">Recall@K</Badge>
                      <Badge variant="outline">NDCG</Badge>
                      <Badge variant="outline">Click-Through Rate (CTR)</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Docs Tab */}
          <TabsContent value="docs">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Implementation Guide (Python)</CardTitle>
                <CardDescription>Sample code for the core recommendation logic</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] w-full rounded-md border bg-slate-950 p-4 font-mono text-xs text-slate-300">
                  <pre>{`
# 1. Data Preprocessing (Pandas/Scikit-Learn)
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

def preprocess_behavior(df):
    # Normalize dwell time and clicks
    scaler = MinMaxScaler()
    df[['dwell_time', 'clicks']] = scaler.fit_transform(df[['dwell_time', 'clicks']])
    
    # Feature Engineering: Engagement Score
    df['engagement_score'] = (df['dwell_time'] * 0.7) + (df['clicks'] * 0.3)
    return df

# 2. Hybrid Model (Basic Matrix Factorization + Content)
import numpy as np
from scipy.sparse.linalg import svds

def get_collaborative_recommendations(user_item_matrix, k=50):
    # Singular Value Decomposition
    u, s, vt = svds(user_item_matrix, k=k)
    s_diag_matrix = np.diag(s)
    predicted_ratings = np.dot(np.dot(u, s_diag_matrix), vt)
    return predicted_ratings

# 3. Content-Based Filtering (Sentence Transformers)
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer('all-MiniLM-L6-v2')

def get_content_recommendations(product_descriptions, target_desc):
    embeddings = model.encode(product_descriptions)
    target_emb = model.encode([target_desc])
    similarities = cosine_similarity(target_emb, embeddings)
    return similarities

# 4. Evaluation Metrics
def evaluate_model(y_true, y_pred, k=10):
    # Precision@K
    # Recall@K
    # NDCG (Normalized Discounted Cumulative Gain)
    pass

# 5. Real-time Feedback Loop
# Triggered by event stream (Kafka/PubSub)
def on_user_click(event):
    # 1. Update User Profile in Redis
    # 2. Re-calculate top-N candidates
    # 3. Push to UI via WebSocket
    pass
                  `}</pre>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span>Note: This is a simplified version for hackathon purposes. Production systems require robust A/B testing and privacy-preserving ML (Differential Privacy).</span>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-slate-500">
          <p className="text-sm">© 2026 RecEngine AI. Built for the Future of E-Commerce.</p>
          <div className="mt-4 flex justify-center gap-4">
            <Badge variant="outline" className="text-[10px]">Privacy First</Badge>
            <Badge variant="outline" className="text-[10px]">Explainable AI</Badge>
            <Badge variant="outline" className="text-[10px]">Real-time Engine</Badge>
          </div>
        </div>
      </footer>
    </div>
  );
}
