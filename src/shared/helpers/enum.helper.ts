export const formatLabel = (label: string) => {
  return label.charAt(0).toUpperCase() + label.slice(1).replace(/_/g, ' ')
}

export const convertEnumToArray = (enumObj: Record<string, string | number>) => {
  return Object.values(enumObj).map((value) => ({
    label: formatLabel(value.toString()),
    value,
  }))
}
