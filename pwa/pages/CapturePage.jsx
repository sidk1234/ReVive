import React, { useState } from 'react';
import {
  Page,
  Block,
  BlockTitle,
  List,
  ListInput,
  Button,
  Preloader,
  Card
} from 'konsta/react';

import { useRouter } from 'next/router';

/**
 * CapturePage allows users to either upload a photo or type an item name.
 * It demonstrates how to use Konsta v5 components (ListInput, Button,
 * Preloader) instead of deprecated components such as Input and Spinner.
 */
export default function CapturePage() {
  const [itemName, setItemName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const router = useRouter();

  const handleAnalyze = () => {
    if (!itemName.trim()) return;
    setLoading(true);
    // Simulate analysis request. In a real app this would call your
    // Supabase Edge Function or API. We delay for 1s and produce a
    // placeholder result.
    setTimeout(() => {
      setResult({
        item: itemName,
        recyclable: Math.random() < 0.5,
        notes:
          'This is a placeholder result. Connect this to your backend to get real data.',
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <Page>
      <Block strong inset className="mt-4">
        <BlockTitle large>Recycle an Item</BlockTitle>
        <List strong inset>
          <ListInput
            label="Item Name"
            type="text"
            placeholder="Type the item you want to recycle"
            clearButton
            onChange={(e) => setItemName(e.target.value)}
            value={itemName}
          />
        </List>
        <div className="mt-4 flex gap-4">
          <Button large onClick={handleAnalyze} disabled={!itemName || loading}>
            Analyze
          </Button>
        </div>
        {loading && (
          <div className="flex justify-center mt-4">
            <Preloader size="w-8 h-8" />
          </div>
        )}
        {result && !loading && (
          <Card className="mt-4">
            <div className="p-4">
              <div className="font-bold mb-2">Result</div>
              <div>Item: {result.item}</div>
              <div>
                Recyclable: {result.recyclable ? 'Yes' : 'No'}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {result.notes}
              </div>
            </div>
          </Card>
        )}
      </Block>
    </Page>
  );
}