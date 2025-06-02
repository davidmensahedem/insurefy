import type { ToolCall } from '@/types/insurance';
import { CheckCircle, ChevronDown, ChevronRight, XCircle } from 'lucide-react';
import React, { useState } from 'react';

interface ToolCallCardProps {
    toolCall: ToolCall;
}

const ToolCallCard: React.FC<ToolCallCardProps> = ({ toolCall }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasResult = toolCall.result !== undefined;

    const getToolIcon = (toolName: string) => {
        switch (toolName) {
            case 'get_insurance_backoffice_data':
                return '🏢';
            case 'search_policies':
                return '📋';
            case 'get_policy_details':
                return '📄';
            case 'search_claims':
                return '🔍';
            case 'create_claim':
                return '✍️';
            case 'get_customer_info':
                return '👤';
            case 'calculate_premium':
                return '💰';
            default:
                return '🔧';
        }
    };

    const formatToolName = (name: string) => {
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const renderResult = (result: any) => {
        if (!result) return null;

        // Handle back office data results
        if (result.data && result.data.results) {
            return (
                <div className="space-y-2">
                    <div className="font-medium text-green-700">
                        Back Office Data - {result.data.totalCount} records found:
                    </div>
                    {result.data.results.slice(0, 3).map((record: any, index: number) => (
                        <div key={index} className="bg-white p-3 rounded border text-xs space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div><strong>Customer:</strong> {record.customerDetails?.customerName}</div>
                                    <div><strong>Mobile:</strong> {record.customerDetails?.customerMobileNumber}</div>
                                    <div><strong>Email:</strong> {record.customerDetails?.customerEmail || 'N/A'}</div>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs ${record.orderDetails?.status === 'Paid'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {record.orderDetails?.status || 'Unknown'}
                                </div>
                            </div>
                            <div className="border-t pt-2">
                                <div><strong>Vehicle:</strong> {record.quoteDetails?.quoteRequest?.make} {record.quoteDetails?.quoteRequest?.model}</div>
                                <div><strong>Reg No:</strong> {record.quoteDetails?.quoteRequest?.registrationNumber}</div>
                                <div><strong>Premium:</strong> GHS {record.quoteDetails?.premiumAmount}</div>
                                <div><strong>Order Date:</strong> {new Date(record.orderDetails?.orderDate).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))}
                    {result.data.totalCount > 3 && (
                        <div className="text-xs text-gray-500 italic">
                            ... and {result.data.totalCount - 3} more records
                        </div>
                    )}
                </div>
            );
        }

        // Format different types of results
        if (result.policies) {
            return (
                <div className="space-y-2">
                    <div className="font-medium text-green-700">Found {result.total} policies:</div>
                    {result.policies.map((policy: any, index: number) => (
                        <div key={index} className="bg-white p-2 rounded border text-xs">
                            <div><strong>Policy:</strong> {policy.policyNumber}</div>
                            <div><strong>Type:</strong> {policy.type}</div>
                            <div><strong>Status:</strong> {policy.status}</div>
                            <div><strong>Customer:</strong> {policy.customer?.firstName} {policy.customer?.lastName}</div>
                        </div>
                    ))}
                </div>
            );
        }

        if (result.claims) {
            return (
                <div className="space-y-2">
                    <div className="font-medium text-green-700">Found {result.total} claims:</div>
                    {result.claims.map((claim: any, index: number) => (
                        <div key={index} className="bg-white p-2 rounded border text-xs">
                            <div><strong>Claim:</strong> {claim.claimNumber}</div>
                            <div><strong>Type:</strong> {claim.type}</div>
                            <div><strong>Status:</strong> {claim.status}</div>
                            <div><strong>Amount:</strong> ${claim.amount}</div>
                        </div>
                    ))}
                </div>
            );
        }

        if (result.policyType && result.estimatedPremium) {
            return (
                <div className="space-y-2">
                    <div className="font-medium text-green-700">Premium Calculation:</div>
                    <div className="bg-white p-2 rounded border text-xs">
                        <div><strong>Policy Type:</strong> {result.policyType}</div>
                        <div><strong>Estimated Premium:</strong> ${result.estimatedPremium}</div>
                        {result.factors && (
                            <div className="mt-1">
                                <strong>Factors:</strong>
                                <ul className="list-disc list-inside ml-2">
                                    {result.factors.map((factor: string, index: number) => (
                                        <li key={index}>{factor}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Default JSON display for other results
        return (
            <div className="space-y-2">
                <div className="font-medium text-green-700">Result:</div>
                <pre className="bg-white p-2 rounded border text-xs overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                </pre>
            </div>
        );
    };

    return (
        <div className="tool-call-card">
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center space-x-2">
                    <span className="text-lg">{getToolIcon(toolCall.name)}</span>
                    <span className="font-medium text-blue-700">
                        {formatToolName(toolCall.name)}
                    </span>
                    {hasResult ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                    )}
                </div>

                {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
            </div>

            {isExpanded && (
                <div className="mt-3 space-y-3 slide-up">
                    {/* Parameters */}
                    {Object.keys(toolCall.parameters).length > 0 && (
                        <div>
                            <div className="font-medium text-gray-700 mb-1">Parameters:</div>
                            <div className="bg-gray-50 p-2 rounded text-xs">
                                {Object.entries(toolCall.parameters).map(([key, value]) => (
                                    <div key={key} className="mb-1">
                                        <strong>{key}:</strong> {JSON.stringify(value)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    {hasResult && (
                        <div>
                            {renderResult(toolCall.result)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ToolCallCard; 