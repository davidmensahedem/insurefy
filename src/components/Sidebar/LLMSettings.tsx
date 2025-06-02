import { useLLMActions, useLLMConfig } from '@/store/appStore';
import { Save, Settings } from 'lucide-react';
import React, { useState } from 'react';

const LLMSettings: React.FC = () => {
    const currentConfig = useLLMConfig();
    const { updateLLMConfig } = useLLMActions();
    const [config, setConfig] = useState(currentConfig);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateLLMConfig(config);
        } catch (error) {
            console.error('Failed to update LLM config:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const availableModels = [
        'Xenova/distilgpt2',
        'Xenova/gpt2',
        'microsoft/DialoGPT-medium',
        'microsoft/DialoGPT-large'
    ];

    return (
        <div className="space-y-3">
            <div className="bg-white border rounded-lg p-3 space-y-3">
                {/* Model Selection */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Model
                    </label>
                    <select
                        value={config.model}
                        onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {availableModels.map(model => (
                            <option key={model} value={model}>
                                {model.split('/').pop()}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Temperature */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Temperature: {config.temperature}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={config.temperature}
                        onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Focused</span>
                        <span>Creative</span>
                    </div>
                </div>

                {/* Max Tokens */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Max Tokens
                    </label>
                    <input
                        type="number"
                        min="50"
                        max="2048"
                        value={config.maxTokens}
                        onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Top P */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Top P: {config.topP}
                    </label>
                    <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={config.topP}
                        onChange={(e) => setConfig(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                        className="w-full"
                    />
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                >
                    {isSaving ? (
                        <Settings className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    {isSaving ? 'Applying...' : 'Apply Settings'}
                </button>
            </div>

            {/* Model Info */}
            <div className="text-xs text-gray-600 space-y-1">
                <div><strong>Current:</strong> {currentConfig.model.split('/').pop()}</div>
                <div><strong>Temp:</strong> {currentConfig.temperature}</div>
                <div><strong>Tokens:</strong> {currentConfig.maxTokens}</div>
                <div><strong>Top P:</strong> {currentConfig.topP}</div>
            </div>
        </div>
    );
};

export default LLMSettings; 