// Subject mask via Apple Vision, no network, no model download.
// Usage: swift tools/mask.swift <photo> <mask.png>
import CoreImage
import Vision

let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2])

let handler = VNImageRequestHandler(url: input)
let request = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([request])
guard let result = request.results?.first else { fatalError("no subject found") }
let mask = try result.generateScaledMaskForImage(forInstances: result.allInstances, from: handler)

let image = CIImage(cvPixelBuffer: mask)
try CIContext().writePNGRepresentation(of: image, to: output, format: .L8, colorSpace: CGColorSpaceCreateDeviceGray())
print("mask \(Int(image.extent.width))x\(Int(image.extent.height)) -> \(output.path)")
