import React, { useState, useRef, useEffect, useCallback } from 'react';
import { debounce } from 'lodash'; // Add this import at the top
import {
  Container,
  Title,
  TextInput,
  Button,
  Group,
  Text,
  ColorPicker,
  Textarea,
  Card,
  Stack,
  CopyButton,
  Tooltip,
  Divider
} from '@mantine/core';

function App() {
  const [text, setText] = useState('Welcome to Discord Colored Text Generator!');
  const [formattedText, setFormattedText] = useState('');
  const [fgColor, setFgColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#000000');
  const textareaRef = useRef(null);
  const [selectedText, setSelectedText] = useState('');
  const [copyCount, setCopyCount] = useState(0);

  // Create debounced function for setting selected text
  const debouncedSetSelectedText = useCallback(
    debounce((text) => setSelectedText(text), 100),
    []
  );

  // Listen for text selection anywhere on the page
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        debouncedSetSelectedText(selection.toString());
      }
    };

    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);
    
    return () => {
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('keyup', handleSelectionChange);
      debouncedSetSelectedText.cancel();
    };
  }, [debouncedSetSelectedText]);

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  // Combined function for applying colors
  const applyColor = (type) => {
    if (!selectedText) return;
    
    const color = type === 'fg' ? fgColor : bgColor;
    // Convert hex to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    const colorCode = `\u001b[${type === 'fg' ? '38' : '48'};2;${r};${g};${b}m${selectedText}\u001b[0m`;
    
    // Append the formatted text to the textarea
    setText(prev => prev + colorCode);
    
    // Clear selection
    window.getSelection().removeAllRanges();
    setSelectedText('');
    
    // Focus back on textarea
    focusTextarea();
  };

  // Helper function to focus textarea and move cursor to end
  const focusTextarea = () => {
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const position = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(position, position);
      }
    }, 0);
  };

  const boldText = () => {
    if (!selectedText) return;
    
    const boldCode = `**${selectedText}**`;
    
    // Append the formatted text to the textarea
    setText(prev => prev + boldCode);
    
    // Clear selection
    window.getSelection().removeAllRanges();
    setSelectedText('');
    
    // Focus back on textarea
    focusTextarea();
  };

  const addLine = () => {
    setText(prev => prev + '\n');
    
    // Focus back on textarea
    focusTextarea();
  };

  const resetText = () => {
    setText('Welcome to Discord Colored Text Generator!');
    setFormattedText('');
    setSelectedText('');
  };

  const generateFormattedText = () => {
    setFormattedText(`\`\`\`ansi\n${text}\n\`\`\``);
  };

  const handleCopy = () => {
    const funnyCopyMessages = ["Copied!", "Double Copy!", "Triple Copy!", "Dominating!!", "Rampage!!", "Mega Copy!!", "Unstoppable!!", "Wicked Sick!!", "Monster Copy!!!", "GODLIKE!!!", "BEYOND GODLIKE!!!!"];
    setCopyCount(prev => Math.min(10, prev + 1));
    
    setTimeout(() => {
      setCopyCount(0);
    }, 2000);
  };

  return (
    <Container size="md" py={40}>
      <Stack spacing="xl">
        <Title order={1} align="center">Discord Colored Text Generator</Title>
        
        <Text>
          This is a simple app that creates colored Discord messages using the ANSI color codes 
          available on the latest Discord desktop versions.
        </Text>
        
        <Text>
          To use this, write your text, select parts of it and assign colors to them, 
          then copy it using the button below, and send in a Discord message.
        </Text>
        
        <Card withBorder p="md">
          <Title order={3} mb="md">Create your text</Title>
          
          <Group mb="md">
            <Button onClick={resetText} color="red">Reset All</Button>
            <Button onClick={boldText} disabled={!selectedText}>Bold</Button>
            <Button onClick={addLine}>Line</Button>
          </Group>
          
          <Group position="apart" mb="md" align="flex-start">
            <Stack spacing="xs">
              <Text weight={500}>FG</Text>
              <ColorPicker 
                format="hex" 
                value={fgColor} 
                onChange={setFgColor}
                swatches={['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff']}
              />
              <Button onClick={() => applyColor('fg')} fullWidth disabled={!selectedText}>Apply Foreground</Button>
            </Stack>
            
            <Stack spacing="xs">
              <Text weight={500}>BG</Text>
              <ColorPicker 
                format="hex" 
                value={bgColor} 
                onChange={setBgColor}
                swatches={['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff']}
              />
              <Button onClick={() => applyColor('bg')} fullWidth disabled={!selectedText}>Apply Background</Button>
            </Stack>
          </Group>
          
          {selectedText && (
            <Card withBorder p="sm" mb="md" bg="gray.1">
              <Text size="sm" weight={500}>Selected Text:</Text>
              <Text>{selectedText}</Text>
            </Card>
          )}
          
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            minRows={5}
            autosize
            mb="md"
          />
          
          <Button onClick={generateFormattedText} fullWidth mb="md">
            Generate Formatted Text
          </Button>
          
          {formattedText && (
            <>
              <Divider my="md" />
              <TextInput
                label="Formatted Text (Copy this to Discord)"
                value={formattedText}
                readOnly
              />
              <Group position="center" mt="md">
                <CopyButton value={formattedText} onCopy={handleCopy}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                      <Button 
                        color={copyCount > 8 ? 'red' : copied ? 'teal' : 'blue'} 
                        onClick={copy}
                      >
                        {copied ? (copyCount > 0 ? funnyCopyMessages[copyCount-1] : 'Copied to clipboard') : 'Copy text as Discord formatted'}
                      </Button>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
            </>
          )}
        </Card>
        
        <Text size="sm" color="dimmed" align="center">
          This is an unofficial tool, it is not made or endorsed by Discord.
        </Text>
      </Stack>
    </Container>
  );
}

export default App;
