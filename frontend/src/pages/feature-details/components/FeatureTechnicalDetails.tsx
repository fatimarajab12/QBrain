import { useState } from "react";
import { Sparkles, Edit2, Save, XCircle, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQueryClient } from "@tanstack/react-query";
import { Feature } from "@/types/feature";
import { featureService } from "@/services/feature.service";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

interface FeatureTechnicalDetailsProps {
  feature: Feature;
  featureId: string;
}

export const FeatureTechnicalDetails = ({ feature, featureId }: FeatureTechnicalDetailsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditingFeatureType, setIsEditingFeatureType] = useState(false);
  const [editedFeatureType, setEditedFeatureType] = useState("");
  const [isSavingTechnicalDetails, setIsSavingTechnicalDetails] = useState(false);

  const handleSaveTechnicalDetails = async () => {
    setIsSavingTechnicalDetails(true);
    try {
      const updateData: {
        name: string;
        description: string;
        priority?: string;
        featureType?: string | null;
      } = {
        name: feature.name,
        description: feature.description,
        priority: feature.priority,
      };
      
      if (feature.featureType !== undefined) {
        updateData.featureType = editedFeatureType || null;
      }
      
      const updatedFeature = await featureService.updateFeature(featureId, updateData);
      queryClient.setQueryData(['feature', featureId], updatedFeature);
      setIsEditingFeatureType(false);
      toast({
        title: "Success",
        description: "Feature information updated successfully",
      });
    } catch (error) {
      logger.error("Error updating feature information", error);
      toast({
        title: "Error",
        description: "Failed to update feature information",
        variant: "destructive",
      });
    } finally {
      setIsSavingTechnicalDetails(false);
    }
  };

  if (!feature.featureType) {
    return null;
  }

  return (
    <>
      <Separator />
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="technical-details" className="border-none">
          <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground py-2">
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Show Technical Details
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-3 p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Feature Information</h3>
                {!isEditingFeatureType && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingFeatureType(true);
                      setEditedFeatureType(feature.featureType || "");
                    }}
                    className="h-7 px-2"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
              
              {isEditingFeatureType ? (
                <div className="space-y-3">
                  {feature.featureType !== undefined && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Feature Type</label>
                      <Select
                        value={editedFeatureType}
                        onValueChange={setEditedFeatureType}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select feature type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FUNCTIONAL">FUNCTIONAL</SelectItem>
                          <SelectItem value="DATA">DATA</SelectItem>
                          <SelectItem value="DATA_MODEL">DATA_MODEL</SelectItem>
                          <SelectItem value="INTERFACE">INTERFACE</SelectItem>
                          <SelectItem value="QUALITY">QUALITY</SelectItem>
                          <SelectItem value="REPORT">REPORT</SelectItem>
                          <SelectItem value="CONSTRAINT">CONSTRAINT</SelectItem>
                          <SelectItem value="NOTIFICATION">NOTIFICATION</SelectItem>
                          <SelectItem value="WORKFLOW">WORKFLOW</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveTechnicalDetails}
                      disabled={isSavingTechnicalDetails}
                      className="h-8"
                    >
                      {isSavingTechnicalDetails ? (
                        <LoadingSpinner size="sm" className="mr-1" />
                      ) : (
                        <Save className="h-3 w-3 mr-1" />
                      )}
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditingFeatureType(false);
                        setEditedFeatureType(feature.featureType || "");
                      }}
                      disabled={isSavingTechnicalDetails}
                      className="h-8"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {feature.featureType && (
                    <Badge variant="outline" className="gap-1">
                      <FileText className="h-3 w-3" />
                      Type: {feature.featureType}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};

