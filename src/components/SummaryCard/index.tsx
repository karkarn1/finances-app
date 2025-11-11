/**
 * SummaryCard Component
 * Displays grouped key-value pairs with optional sections
 * Performance optimization: Memoized to prevent re-renders when props unchanged
 */
import { FC, ReactNode, memo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Skeleton,
} from '@mui/material';

export interface SummaryItem {
  /** Item label */
  label: string;
  /** Item value */
  value: string | number | ReactNode;
  /** Optional value color */
  valueColor?: string;
  /** Optional bold value */
  valueBold?: boolean;
}

export interface SummarySection {
  /** Optional section title */
  title?: string;
  /** Items in this section */
  items: SummaryItem[];
}

export interface SummaryCardProps {
  /** Card title */
  title: string;
  /** Summary sections */
  sections: SummarySection[];
  /** Loading state */
  loading?: boolean;
  /** Optional test ID */
  'data-testid'?: string;
}

/**
 * Memoized SummaryCard component
 * Only re-renders when props actually change
 */
export const SummaryCard: FC<SummaryCardProps> = memo(({
  title,
  sections,
  loading = false,
  'data-testid': dataTestId,
}) => {
  return (
    <Card data-testid={dataTestId}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {loading ? (
          <Box>
            <Skeleton width="100%" height={30} sx={{ mb: 1 }} />
            <Skeleton width="100%" height={30} sx={{ mb: 1 }} />
            <Skeleton width="100%" height={30} sx={{ mb: 1 }} />
          </Box>
        ) : (
          sections.map((section, sectionIndex) => (
            <Box key={sectionIndex}>
              {section.title && (
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mt: sectionIndex > 0 ? 2 : 0, mb: 1 }}
                >
                  {section.title}
                </Typography>
              )}
              {section.items.map((item, itemIndex) => (
                <Box
                  key={itemIndex}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: item.valueBold ? 600 : 400,
                      color: item.valueColor || 'text.primary',
                    }}
                    data-testid={
                      dataTestId
                        ? `${dataTestId}-${item.label.toLowerCase().replace(/\s+/g, '-')}`
                        : undefined
                    }
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
              {sectionIndex < sections.length - 1 && (
                <Divider sx={{ my: 1 }} />
              )}
            </Box>
          ))
        )}
      </CardContent>
    </Card>
  );
});
