/// Non-default frequency estimation methods
/// These methods are activated when the user changes the Frequency Estimation dropdown
/// from the default (FFT). They may be deprecated in the future.
///
/// Default method: FFT (see ../fft.rs)
/// Non-default methods (this module):
///   - zero-crossing: Simple zero-crossing counting
///   - autocorrelation: Time-domain autocorrelation
///   - stft: Short-Time Fourier Transform
///   - cqt: Constant-Q Transform

pub mod zero_crossing;
pub mod autocorrelation;
pub mod stft;
pub mod cqt;
